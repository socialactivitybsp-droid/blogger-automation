import axios from 'axios';

const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const BLOGGER_API_BASE = 'https://www.googleapis.com/blogger/v3';

export async function exchangeCodeForTokens(code) {
  const response = await axios.post(
    GOOGLE_OAUTH_TOKEN_URL,
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  return response.data;
}

export async function refreshAccessToken(refreshToken) {
  const response = await axios.post(
    GOOGLE_OAUTH_TOKEN_URL,
    new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  return response.data;
}

export async function fetchBlogs(accessToken) {
  const response = await axios.get(`${BLOGGER_API_BASE}/users/self/blogs`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data.items || [];
}

export async function publishPost({ accessToken, blogId, title, content, labels, publishMode, slug }) {
  const params = new URLSearchParams();
  if (publishMode === 'DRAFT') {
    params.set('isDraft', 'true');
  }
  if (slug) {
    params.set('customMetaData', slug);
  }

  const response = await axios.post(
    `${BLOGGER_API_BASE}/blogs/${blogId}/posts?${params.toString()}`,
    {
      kind: 'blogger#post',
      blog: { id: blogId },
      title,
      content,
      labels,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
}
