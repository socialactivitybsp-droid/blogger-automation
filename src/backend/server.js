import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import {
  exchangeCodeForTokens,
  fetchBlogs,
  publishPost,
  refreshAccessToken,
} from './bloggerClient.js';
import { readTokens, saveTokens } from './tokenStore.js';

const app = express();
const port = process.env.PORT || 8787;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '2mb' }));

const requiredEnv = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];

function assertEnv() {
  const missing = requiredEnv.filter((entry) => !process.env[entry]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}

async function getValidAccessToken() {
  const saved = await readTokens();
  if (!saved) {
    throw new Error('No OAuth tokens found. Authorize first.');
  }

  if (!saved.expires_at || Date.now() > saved.expires_at - 60_000) {
    if (!saved.refresh_token) {
      throw new Error('Refresh token missing. Re-authorize with prompt=consent.');
    }

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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/google', async (req, res) => {
  try {
    assertEnv();
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required.' });
    }

    const tokens = await exchangeCodeForTokens(code);
    const toStore = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
    };

    await saveTokens(toStore);

    return res.json({ ok: true, scope: toStore.scope, expires_at: toStore.expires_at });
  } catch (error) {
    return res.status(500).json({ error: error.response?.data?.error_description || error.message });
  }
});

app.get('/api/user/blogs', async (_req, res) => {
  try {
    const accessToken = await getValidAccessToken();
    const blogs = await fetchBlogs(accessToken);

    return res.json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: error.response?.data?.error?.message || error.message });
  }
});

app.post('/api/blogger/publish', async (req, res) => {
  try {
    const { blogId, title, content, labels = [], publishMode = 'LIVE', slug = '' } = req.body;
    if (!blogId || !title || !content) {
      return res.status(400).json({ error: 'blogId, title, and content are required.' });
    }

    const accessToken = await getValidAccessToken();
    const post = await publishPost({ accessToken, blogId, title, content, labels, publishMode, slug });
    return res.json({ id: post.id, url: post.url, status: post.status });
  } catch (error) {
    return res.status(500).json({ error: error.response?.data?.error?.message || error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
