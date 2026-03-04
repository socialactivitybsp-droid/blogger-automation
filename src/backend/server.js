import 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { parse as parseUrl } from 'node:url';
import {
  exchangeCodeForTokens,
  fetchBlogs,
  fetchPosts,
  publishPost,
  refreshAccessToken,
  updatePost,
} from './bloggerClient.js';
import { readTokens, saveTokens } from './tokenStore.js';

function loadEnvFile() {
  const envPath = '.env';
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const port = Number(process.env.PORT || 8787);
const requiredEnv = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  let data = '';
  for await (const chunk of req) data += chunk;
  if (!data) return {};
  return JSON.parse(data);
}

function assertEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

async function getValidAccessToken() {
  const saved = await readTokens();
  if (!saved) throw new Error('No OAuth tokens found. Authorize Blogger first.');

  if (!saved.expires_at || Date.now() > saved.expires_at - 60_000) {
    if (!saved.refresh_token) throw new Error('Refresh token missing. Re-authorize with consent prompt.');
    const refreshed = await refreshAccessToken(saved.refresh_token);
    const updated = {
      ...saved,
      access_token: refreshed.access_token,
      expires_at: Date.now() + (refreshed.expires_in || 3600) * 1000,
    };
    await saveTokens(updated);
    return updated.access_token;
  }

  return saved.access_token;
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });

  const { pathname, query } = parseUrl(req.url, true);

  try {
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true });
    }


    if (pathname === '/api/auth/status' && req.method === 'GET') {
      const saved = await readTokens();
      return sendJson(res, 200, { bloggerSignedIn: Boolean(saved?.access_token) });
    }
    if (pathname === '/api/auth/config' && req.method === 'GET') {
      const missing = requiredEnv.filter((key) => !process.env[key]);
      return sendJson(res, 200, {
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || '',
        missing,
      });
    }

    if (pathname === '/api/auth/google' && req.method === 'POST') {
      assertEnv();
      const { code } = await readBody(req);
      if (!code) return sendJson(res, 400, { error: 'Authorization code is required.' });

      const tokens = await exchangeCodeForTokens(code);
      const toStore = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
      };
      await saveTokens(toStore);
      return sendJson(res, 200, { ok: true, scope: toStore.scope, expires_at: toStore.expires_at });
    }

    if (pathname === '/api/user/blogs' && req.method === 'GET') {
      const accessToken = await getValidAccessToken();
      const blogs = await fetchBlogs(accessToken);
      return sendJson(res, 200, { blogs });
    }

    if (pathname === '/api/blogger/posts' && req.method === 'GET') {
      const blogId = query.blogId;
      if (!blogId) return sendJson(res, 400, { error: 'blogId is required' });
      const accessToken = await getValidAccessToken();
      const posts = await fetchPosts(accessToken, blogId);
      return sendJson(res, 200, { posts });
    }

    if (pathname === '/api/blogger/publish' && req.method === 'POST') {
      const { blogId, title, content, labels = [], publishMode = 'LIVE' } = await readBody(req);
      if (!blogId || !title || !content) return sendJson(res, 400, { error: 'blogId, title, and content are required.' });
      const accessToken = await getValidAccessToken();
      const post = await publishPost({ accessToken, blogId, title, content, labels, publishMode });
      return sendJson(res, 200, { id: post.id, url: post.url, status: post.status });
    }

    if (pathname === '/api/blogger/update' && req.method === 'POST') {
      const { blogId, postId, title, content, labels = [] } = await readBody(req);
      if (!blogId || !postId || !title || !content) return sendJson(res, 400, { error: 'blogId, postId, title, and content are required.' });
      const accessToken = await getValidAccessToken();
      const post = await updatePost({ accessToken, blogId, postId, title, content, labels });
      return sendJson(res, 200, { id: post.id, url: post.url, status: post.status });
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Server error' });
  }
});

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
