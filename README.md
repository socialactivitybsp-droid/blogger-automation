# Sociallia News Agent

Modern React dashboard + generation/editor workflow with persistent Zustand state.

## Stack
- React + Vite
- React Router
- Zustand (persisted in localStorage)
- Appwrite (Google auth + hero image upload)
- Puter.js (AI auth)
- TipTap (Compose editor)
- Monaco Editor (HTML editor with line numbers)
- Leaflet + OpenStreetMap (location picker)

## Env
Create `.env`:

```bash
VITE_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=695f94f9003a97931795
VITE_APPWRITE_BUCKET_ID=695f9d8b0029dbe41ecb
```

## Routes
- `/` Dashboard
- `/generate` Generation page
- `/editor` Editor page

## Features implemented
- Dashboard with auth actions, post grid, stats, recent activity, tool buttons.
- Generation page with input mode switch, hero upload, full-screen generating overlay.
- Editor page with compose/html toggle in one large editor area.
- Bidirectional sync between TipTap and Monaco via global `content_html` state.
- Slide-in settings panel for labels, slug, location search/map click, and search description counter.
- Persistent global state for:
  - `title`
  - `content_html`
  - `labels`
  - `slug`
  - `search_description`
  - `location`
  - `hero_image`
- Draft/Publish buttons are dummy UI actions (local status only).

## Run
```bash
npm install
npm run dev
```
