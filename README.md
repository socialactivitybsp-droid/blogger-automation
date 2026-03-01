# Blogger Automation (React + Node/Express)

Production-ready blog generation and publishing workflow:

- **Frontend (React hooks)** in `src/frontend`
- **Backend (Node.js + Express)** in `src/backend`
- **Puter.js AI** generation with strict JSON schema
- **Google OAuth 2.0** token exchange and secure token storage
- **Blogger API v3** publishing (live or draft)

## Features

### Frontend
- Input modes:
  - Title + Description
  - Description only
- `Generate` button calls Puter.js and expects strict JSON keys:
  - `title`
  - `search_description`
  - `slug`
  - `labels`
  - `hero_image`
  - `content_html`
- Generated output includes:
  - Meta panel (title, search description, labels, slug)
  - Compose View (rendered HTML)
  - HTML View (raw editable HTML)
- Master template injection inserts:
  - hero image
  - content HTML
- `Publish to Blogger` button sends final editable HTML to backend.

### Backend
- `POST /api/auth/google`
  - Exchanges Google OAuth authorization code for access/refresh tokens.
- `GET /api/user/blogs`
  - Returns authenticated user's blogs.
- `POST /api/blogger/publish`
  - Publishes/saves post draft using Blogger API.
- Secure token persistence
  - Encrypted local token file via AES (`src/backend/.tokens.enc`).

---

## Project Structure

```txt
src/
  frontend/
    App.jsx
    app.css
    utils/masterTemplate.js
  backend/
    server.js
    bloggerClient.js
    tokenStore.js
```

---

## Environment Variables

Create `.env` in project root:

```env
# Backend
PORT=8787
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/
TOKEN_ENCRYPTION_KEY=replace-with-strong-random-secret
CORS_ORIGIN=http://localhost:5173

# Frontend (Vite)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/
VITE_API_BASE_URL=http://localhost:8787
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

> Use the same `GOOGLE_CLIENT_ID` on frontend and backend.

---

## Google Cloud Console Setup (OAuth + Blogger API)

1. Open **Google Cloud Console**.
2. Create/select a project.
3. Go to **APIs & Services → Library** and enable:
   - **Blogger API v3**
4. Go to **APIs & Services → OAuth consent screen**:
   - Configure app name, support email, and developer email.
   - Add scope:
     - `https://www.googleapis.com/auth/blogger`
5. Go to **Credentials → Create Credentials → OAuth Client ID**:
   - Application type: **Web application**
   - Authorized redirect URI(s):
     - `http://localhost:5173/`
     - (plus your production domain callback URI)
6. Copy **Client ID** and **Client Secret** into `.env`.

---

## Install and Run

```bash
npm install
npm run backend
npm run dev
```

Or run both in parallel:

```bash
npm run dev:full
```

Open frontend at: `http://localhost:5173`.

---

## OAuth Flow

1. Click **Sign in with Google** in frontend.
2. Complete consent flow.
3. You return to redirect URI with `?code=...`.
4. Click **Complete OAuth (after redirect)**.
5. Click **Load Blogs** to list your blogs.

---

## Blogger Publish Request

Backend sends:

- `POST https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts`
- Header: `Authorization: Bearer ACCESS_TOKEN`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "kind": "blogger#post",
  "blog": { "id": "blogId" },
  "title": "...",
  "content": "...",
  "labels": ["..."]
}
```

Draft mode uses `?isDraft=true`.

---

## Notes for Production Deployment

- Move token storage from local file to encrypted database or secret manager.
- Use HTTPS-only redirect URIs.
- Rotate `TOKEN_ENCRYPTION_KEY` and use a KMS-backed secret.
- Restrict CORS to trusted frontend domain(s).
- Add structured logs and monitoring.

