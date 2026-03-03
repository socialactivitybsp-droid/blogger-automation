import { useMemo, useState } from 'react';
import { injectTemplate } from './utils/masterTemplate';
import './app.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
const OAUTH_SCOPE = 'https://www.googleapis.com/auth/blogger';

const emptyGenerated = {
  title: '',
  search_description: '',
  slug: '',
  labels: [],
  hero_image: '',
  content_html: '',
};

function normalizePuterResponse(rawResponse) {
  const raw = rawResponse
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(raw);
  return {
    ...emptyGenerated,
    ...parsed,
    labels: Array.isArray(parsed.labels)
      ? parsed.labels
      : String(parsed.labels || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
  };
}

export default function App() {
  const [inputMode, setInputMode] = useState('title-description');
  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [generated, setGenerated] = useState(emptyGenerated);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [htmlEditor, setHtmlEditor] = useState('');
  const [viewMode, setViewMode] = useState('compose');
  const [blogs, setBlogs] = useState([]);
  const [selectedBlogId, setSelectedBlogId] = useState('');
  const [publishMode, setPublishMode] = useState('LIVE');
  const [loading, setLoading] = useState({ generate: false, auth: false, blogs: false, publish: false });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const hasGeneratedContent = Boolean(generated?.title && htmlEditor);

  const oauthUrl = useMemo(() => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/oauth-callback`,
      response_type: 'code',
      scope: OAUTH_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, []);

  const handleGenerate = async () => {
    if (!descriptionInput.trim()) {
      setError('Description is required.');
      return;
    }

    if (!window.puter?.ai?.chat) {
      setError('Puter.js is not loaded. Add VITE_PUTER_SCRIPT or check internet access.');
      return;
    }

    setError('');
    setStatus('');
    setLoading((prev) => ({ ...prev, generate: true }));

    const prompt = `You are an expert SEO blogger assistant. Return STRICT JSON only, no markdown, no extra text.
Required keys exactly:
{
  "title": "",
  "search_description": "",
  "slug": "",
  "labels": [],
  "hero_image": "",
  "content_html": ""
}
Rules:
- content_html: only clean paragraph HTML (<p>...</p>) and optional h2/h3 headings.
- slug must be URL-safe lowercase with hyphens.
- labels should be 3-6 topical labels.
- Generate high quality SEO title and search_description.
Input mode: ${inputMode}.
Title (optional): ${titleInput || '(none)'}
Description: ${descriptionInput}`;

    try {
      const response = await window.puter.ai.chat(prompt);
      const content = response?.message?.content || '{}';
      const normalized = normalizePuterResponse(content);
      const templatedHtml = injectTemplate({
        heroImage: normalized.hero_image,
        contentHtml: normalized.content_html,
        gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
      });

      setGenerated(normalized);
      setRenderedHtml(templatedHtml);
      setHtmlEditor(templatedHtml);
      setStatus('Content generated successfully. You can edit HTML before publishing.');
    } catch (generationError) {
      setError(generationError.message || 'Unable to generate content via Puter.js.');
    } finally {
      setLoading((prev) => ({ ...prev, generate: false }));
    }
  };

  const handleOAuthExchange = async () => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      setError('No OAuth code found. Click Sign in with Google first.');
      return;
    }

    setLoading((prev) => ({ ...prev, auth: true }));
    setError('');
    try {
      const result = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const payload = await result.json();
      if (!result.ok) {
        throw new Error(payload.error || 'OAuth exchange failed.');
      }

      setStatus('Google OAuth linked successfully. Fetch blogs now.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (oauthError) {
      setError(oauthError.message);
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  const fetchBlogs = async () => {
    setLoading((prev) => ({ ...prev, blogs: true }));
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/user/blogs`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to fetch blogs.');
      }

      setBlogs(payload.blogs || []);
      if (payload.blogs?.[0]?.id) {
        setSelectedBlogId(payload.blogs[0].id);
      }
      setStatus(`Loaded ${payload.blogs?.length || 0} blog(s).`);
    } catch (blogsError) {
      setError(blogsError.message);
    } finally {
      setLoading((prev) => ({ ...prev, blogs: false }));
    }
  };

  const publishPost = async () => {
    if (!selectedBlogId) {
      setError('Select a blog before publishing.');
      return;
    }

    if (!hasGeneratedContent) {
      setError('Generate content first.');
      return;
    }

    setLoading((prev) => ({ ...prev, publish: true }));
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/blogger/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: selectedBlogId,
          publishMode,
          title: generated.title,
          content: htmlEditor,
          labels: generated.labels,
          slug: generated.slug,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Publish failed.');
      }

      setStatus(`Published successfully: ${payload.url}`);
    } catch (publishError) {
      setError(publishError.message);
    } finally {
      setLoading((prev) => ({ ...prev, publish: false }));
    }
  };

  return (
    <main className="app theme-red-white">
      <h1>React + Express Blogger Publisher</h1>
      <p className="subtitle">Generate SEO content with Puter.js and publish to Blogger in one workflow.</p>

      <section className="card">
        <h2>1) Input Mode</h2>
        <div className="mode-row">
          <label>
            <input
              type="radio"
              checked={inputMode === 'title-description'}
              onChange={() => setInputMode('title-description')}
            />
            Title + Description
          </label>
          <label>
            <input type="radio" checked={inputMode === 'description-only'} onChange={() => setInputMode('description-only')} />
            Only Description
          </label>
        </div>

        {inputMode === 'title-description' && (
          <input value={titleInput} onChange={(event) => setTitleInput(event.target.value)} placeholder="Seed title" />
        )}
        <textarea
          value={descriptionInput}
          onChange={(event) => setDescriptionInput(event.target.value)}
          placeholder="Story facts, angle, location, and context"
          rows={6}
        />
        <button type="button" onClick={handleGenerate} disabled={loading.generate}>
          {loading.generate ? 'Generating...' : 'Generate'}
        </button>
      </section>

      <section className="card">
        <h2>2) Google OAuth + Blogs</h2>
        <div className="actions">
          <a className="button-link" href={oauthUrl}>
            Sign in with Google
          </a>
          <button type="button" onClick={handleOAuthExchange} disabled={loading.auth}>
            {loading.auth ? 'Exchanging code...' : 'Complete OAuth (after redirect)'}
          </button>
          <button type="button" onClick={fetchBlogs} disabled={loading.blogs}>
            {loading.blogs ? 'Loading blogs...' : 'Load Blogs'}
          </button>
        </div>

        <label htmlFor="blogSelect">Select blog</label>
        <select id="blogSelect" value={selectedBlogId} onChange={(event) => setSelectedBlogId(event.target.value)}>
          <option value="">-- Choose a blog --</option>
          {blogs.map((blog) => (
            <option value={blog.id} key={blog.id}>
              {blog.name} ({blog.id})
            </option>
          ))}
        </select>
      </section>

      <section className="card">
        <h2>3) Generated Meta + Editor</h2>
        <p><strong>Title:</strong> {generated.title || '-'}</p>
        <p><strong>Search Description:</strong> {generated.search_description || '-'}</p>
        <p><strong>Slug:</strong> {generated.slug || '-'}</p>
        <p><strong>Labels:</strong> {(generated.labels || []).join(', ') || '-'}</p>

        <div className="mode-row">
          <button type="button" onClick={() => setViewMode('compose')} className={viewMode === 'compose' ? 'active' : ''}>
            Compose View
          </button>
          <button type="button" onClick={() => setViewMode('html')} className={viewMode === 'html' ? 'active' : ''}>
            HTML View
          </button>
        </div>

        {viewMode === 'compose' ? (
          <div className="preview" dangerouslySetInnerHTML={{ __html: renderedHtml || htmlEditor }} />
        ) : (
          <textarea value={htmlEditor} onChange={(event) => setHtmlEditor(event.target.value)} rows={16} />
        )}

        <label>
          Publish mode
          <select value={publishMode} onChange={(event) => setPublishMode(event.target.value)}>
            <option value="LIVE">Publish now</option>
            <option value="DRAFT">Save as draft</option>
          </select>
        </label>

        <button type="button" onClick={publishPost} disabled={loading.publish || !hasGeneratedContent}>
          {loading.publish ? 'Publishing...' : 'Publish to Blogger'}
        </button>
      </section>

      {status ? <p className="status">{status}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
