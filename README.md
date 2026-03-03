# Sociallia News Agent (Working Blogger Integration)

This version is focused on making Blogger workflow actually work end-to-end:

- Google OAuth code exchange
- Token refresh handling
- Load user blogs
- Load already uploaded posts (live + draft)
- Create new post as LIVE or DRAFT
- Update existing posts

## Required environment variables

Create `.env` in project root:

```env
PORT=8787
CORS_ORIGIN=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173
TOKEN_ENCRYPTION_KEY=change-this-secret

VITE_API_BASE_URL=http://localhost:8787
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173

VITE_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=695f94f9003a97931795
VITE_APPWRITE_BUCKET_ID=695f9d8b0029dbe41ecb
```

## Run

Terminal 1:
```bash
npm run backend
```

Terminal 2:
```bash
npm run dev
```

## Backend endpoints

- `POST /api/auth/google` - exchange OAuth code
- `GET /api/user/blogs` - list blogs
- `GET /api/blogger/posts?blogId=...` - list uploaded posts
- `POST /api/blogger/publish` - create post (`publishMode: LIVE|DRAFT`)
- `POST /api/blogger/update` - update existing post

## UI flow

1. Click **Sign in with Google**.
2. After redirect, app exchanges code automatically.
3. Click **Load Blogs**.
4. Select blog and click **Load Uploaded Posts**.
5. Create new draft/live posts or edit loaded posts and click **Update Post**.

