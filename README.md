# Sociallia News Agent (Blogger OAuth + Publish)

This build supports a full Blogger flow:
- connect Blogger OAuth
- load blogs
- load already uploaded posts (live + draft)
- create new post (live or draft)
- update an existing post

## Why you were getting `invalid_redirect_uri`

Your previous env used Appwrite callback URI as `GOOGLE_REDIRECT_URI`:

`https://sfo.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/695f94f9003a97931795`

That URI is valid for **Appwrite-managed login flow**, but your backend `/api/auth/google` does a **direct Google code exchange**. For that backend exchange flow, Google must redirect back to **your app URL**, not Appwrite callback.

## Correct setup (recommended for this code)

### 1) Google Cloud Console → OAuth Client (Web)
Add this Authorized Redirect URI:
- `http://localhost:5173`

(plus your production frontend callback URL, e.g. `https://yourdomain.com`)

### 2) `.env`
Use this shape:

```env
PORT=8787
CORS_ORIGIN=http://localhost:5173

GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_WEB_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:5173
TOKEN_ENCRYPTION_KEY=CHANGE_THIS_SECRET

VITE_API_BASE_URL=http://localhost:8787

VITE_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=695f94f9003a97931795
VITE_APPWRITE_BUCKET_ID=695f9d8b0029dbe41ecb
```

> `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_REDIRECT_URI` are not needed now; frontend reads backend auth config via `/api/auth/config`.

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
- `GET /api/auth/config`
- `POST /api/auth/google`
- `GET /api/user/blogs`
- `GET /api/blogger/posts?blogId=...`
- `POST /api/blogger/publish`
- `POST /api/blogger/update`

## Important security note
You posted your Google client secret publicly in chat/screenshots. Rotate that secret immediately in Google Cloud Console and update `.env`.
