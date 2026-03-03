const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const BLOGGER_API_BASE = 'https://www.googleapis.com/blogger/v3';

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error_description || payload.error?.message || payload.error || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

export async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  return request(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

export async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  return request(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

export async function fetchBlogs(accessToken) {
  const payload = await request(`${BLOGGER_API_BASE}/users/self/blogs`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return payload.items || [];
}

export async function fetchPosts(accessToken, blogId) {
  const payload = await request(`${BLOGGER_API_BASE}/blogs/${blogId}/posts?fetchBodies=true&status=LIVE&status=DRAFT`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return payload.items || [];
}

export async function publishPost({ accessToken, blogId, title, content, labels = [], publishMode = 'LIVE' }) {
  const params = new URLSearchParams();
  if (publishMode === 'DRAFT') params.set('isDraft', 'true');

  return request(`${BLOGGER_API_BASE}/blogs/${blogId}/posts?${params.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kind: 'blogger#post',
      blog: { id: blogId },
      title,
      content,
      labels,
    }),
  });
}

export async function updatePost({ accessToken, blogId, postId, title, content, labels = [] }) {
  return request(`${BLOGGER_API_BASE}/blogs/${blogId}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content, labels }),
  });
}
