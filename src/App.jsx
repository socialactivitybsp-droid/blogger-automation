import { useEffect, useMemo, useState } from 'react';
import { StoreProvider, useStore } from './store/useStore';
import { MASTER_TEMPLATE } from './utils/masterTemplate';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

function injectTemplate(hero, content) {
  return MASTER_TEMPLATE.replaceAll('{{HERO_IMAGE}}', hero || '').replace('{{CONTENT}}', content || '<p></p>');
}

function AppShell() {
  const { state, update } = useStore();
  const [page, setPage] = useState('dashboard');
  const [mode, setMode] = useState('title-description');
  const [seedTitle, setSeedTitle] = useState(state.title);
  const [descriptionInput, setDescriptionInput] = useState(state.search_description);
  const [viewMode, setViewMode] = useState('compose');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [puterConnected, setPuterConnected] = useState(false);

  const googleAuthUrl = useMemo(() => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/blogger',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) return;

    fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.error) throw new Error(payload.error);
        setMsg('Google OAuth connected.');
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch((error) => setMsg(`OAuth failed: ${error.message}`));
  }, []);

  const connectPuter = async () => {
    try {
      if (!window.puter?.auth?.signIn) throw new Error('Puter.js unavailable');
      await window.puter.auth.signIn();
      setPuterConnected(true);
    } catch (error) {
      setMsg(error.message);
    }
  };

  const fetchBlogs = async () => {
    const response = await fetch(`${API_BASE}/api/user/blogs`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Failed to load blogs');
    update({ blogs: payload.blogs, selectedBlogId: payload.blogs[0]?.id || '' });
  };

  const fetchPosts = async () => {
    if (!state.selectedBlogId) throw new Error('Select blog first');
    const response = await fetch(`${API_BASE}/api/blogger/posts?blogId=${state.selectedBlogId}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Failed to load posts');
    update({ posts: payload.posts || [] });
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const title = mode === 'title-description' ? seedTitle || `News: ${descriptionInput.slice(0, 45)}` : `News: ${descriptionInput.slice(0, 45)}`;
      const labels = ['sociallia', 'news'];
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const content = `<p>${descriptionInput || 'Generated content.'}</p><p>More details will be edited in compose view.</p>`;
      update({
        title,
        labels,
        slug,
        search_description: descriptionInput.slice(0, 150),
        content_html: injectTemplate(state.hero_image, content),
      });
      setLoading(false);
      setPage('editor');
    }, 1200);
  };

  const uploadHero = async (file) => {
    if (!file) return;
    try {
      const form = new FormData();
      form.append('fileId', `hero-${Date.now()}`);
      form.append('file', file);

      const upload = await fetch(
        `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files`,
        {
          method: 'POST',
          headers: { 'X-Appwrite-Project': import.meta.env.VITE_APPWRITE_PROJECT_ID },
          body: form,
        },
      );
      const payload = await upload.json();
      if (!upload.ok) throw new Error(payload.message || 'Appwrite upload failed');

      const imageUrl = `${import.meta.env.VITE_APPWRITE_ENDPOINT}/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${payload.$id}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}`;
      update({ hero_image: imageUrl, content_html: injectTemplate(imageUrl, state.content_html) });
    } catch {
      const local = URL.createObjectURL(file);
      update({ hero_image: local, content_html: injectTemplate(local, state.content_html) });
    }
  };

  const publish = async (publishMode) => {
    const response = await fetch(`${API_BASE}/api/blogger/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blogId: state.selectedBlogId,
        title: state.title,
        content: state.content_html,
        labels: state.labels,
        publishMode,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Publish failed');
    setMsg(`Success: ${payload.url}`);
    await fetchPosts();
  };

  const updateExistingPost = async () => {
    if (!state.postId) throw new Error('Select a post from dashboard first');
    const response = await fetch(`${API_BASE}/api/blogger/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blogId: state.selectedBlogId,
        postId: state.postId,
        title: state.title,
        content: state.content_html,
        labels: state.labels,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Update failed');
    setMsg(`Updated: ${payload.url}`);
    await fetchPosts();
  };

  const safeAction = async (task) => {
    try {
      setMsg('');
      await task();
    } catch (error) {
      setMsg(error.message);
    }
  };

  return (
    <main className="app">
      <header className="topbar">
        <h1>Sociallia News Agent</h1>
        <div className="actions">
          <a className="btn" href={googleAuthUrl}>Sign in with Google</a>
          <button className="btn secondary" type="button" onClick={() => safeAction(connectPuter)}>
            Sign in with Puter AI
          </button>
          <span className={puterConnected ? 'connected' : 'disconnected'}>{puterConnected ? '● Connected' : '● Not Connected'}</span>
        </div>
      </header>

      <section className="toolbar-row">
        <button className="btn secondary" type="button" onClick={() => setPage('dashboard')}>Dashboard</button>
        <button className="btn secondary" type="button" onClick={() => setPage('generate')}>+ Create Post</button>
        <button className="btn secondary" type="button" onClick={() => safeAction(fetchBlogs)}>Load Blogs</button>
        <select value={state.selectedBlogId} onChange={(e) => update({ selectedBlogId: e.target.value })}>
          <option value="">Select blog</option>
          {state.blogs.map((blog) => (
            <option key={blog.id} value={blog.id}>{blog.name}</option>
          ))}
        </select>
        <button className="btn secondary" type="button" onClick={() => safeAction(fetchPosts)}>Load Uploaded Posts</button>
      </section>

      {msg ? <p className="msg">{msg}</p> : null}

      {page === 'dashboard' ? (
        <section className="card">
          <h2>Posts Overview</h2>
          {state.posts.length === 0 ? <p>No posts yet. Create your first AI article.</p> : null}
          <div className="grid">
            {state.posts.map((post) => (
              <article key={post.id} className="post-card">
                <h3>{post.title}</h3>
                <p>{(post.content || '').replace(/<[^>]+>/g, '').slice(0, 120)}</p>
                <small>{new Date(post.updated || post.published || Date.now()).toLocaleString()}</small>
                <p><b>Status:</b> {post.status || 'LIVE'}</p>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => {
                    update({
                      postId: post.id,
                      title: post.title || '',
                      content_html: post.content || '<p></p>',
                      labels: post.labels || [],
                    });
                    setPage('editor');
                  }}
                >
                  Edit
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {page === 'generate' ? (
        <section className="card">
          <h2>1) Input Mode</h2>
          <label><input type="radio" checked={mode === 'title-description'} onChange={() => setMode('title-description')} /> Title + Description</label>
          <label><input type="radio" checked={mode === 'description-only'} onChange={() => setMode('description-only')} /> Only Description</label>
          {mode === 'title-description' ? <input placeholder="Seed title" value={seedTitle} onChange={(e) => setSeedTitle(e.target.value)} /> : null}
          <textarea placeholder="Story facts, angle, location, and context" rows={7} value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} />
          <h2>2) Hero Image Upload</h2>
          <label className="upload-box">
            <input hidden type="file" accept="image/*" onChange={(e) => safeAction(() => uploadHero(e.target.files?.[0]))} />
            <span>File Upload</span>
          </label>
          {state.hero_image ? <img className="hero-preview" src={state.hero_image} alt="hero" /> : null}
          <button className="btn big" type="button" onClick={handleGenerate}>Generate</button>
        </section>
      ) : null}

      {page === 'editor' ? (
        <section className="card editor">
          <div className="editor-actions">
            <button className="btn secondary" type="button" onClick={() => setPage('generate')}>← Back</button>
            <button className="btn secondary" type="button" onClick={() => setShowSettings((prev) => !prev)}>⚙ Settings</button>
            <button className="btn secondary" type="button" onClick={() => safeAction(() => publish('DRAFT'))}>Save Draft</button>
            <button className="btn" type="button" onClick={() => safeAction(() => publish('LIVE'))}>Publish</button>
            <button className="btn secondary" type="button" onClick={() => safeAction(updateExistingPost)}>Update Post</button>
          </div>

          <input value={state.title} onChange={(e) => update({ title: e.target.value })} placeholder="Title" />
          <div className="view-toggle">
            <button className={viewMode === 'compose' ? 'active' : ''} type="button" onClick={() => setViewMode('compose')}>Compose View</button>
            <button className={viewMode === 'html' ? 'active' : ''} type="button" onClick={() => setViewMode('html')}>HTML View</button>
          </div>

          {viewMode === 'compose' ? (
            <div
              className="compose"
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => update({ content_html: e.currentTarget.innerHTML })}
              dangerouslySetInnerHTML={{ __html: state.content_html }}
            />
          ) : (
            <textarea className="html-editor" value={state.content_html} onChange={(e) => update({ content_html: e.target.value })} />
          )}

          {showSettings ? (
            <aside className="settings-panel">
              <h3>Post settings</h3>
              <label>Labels (comma separated)</label>
              <input value={state.labels.join(', ')} onChange={(e) => update({ labels: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />
              <label>Permalink</label>
              <input value={state.slug} onChange={(e) => update({ slug: e.target.value })} />
              <label>Location</label>
              <input value={state.location.name} onChange={(e) => update({ location: { ...state.location, name: e.target.value } })} />
              <div className="row">
                <input placeholder="Lat" value={state.location.lat} onChange={(e) => update({ location: { ...state.location, lat: e.target.value } })} />
                <input placeholder="Lng" value={state.location.lng} onChange={(e) => update({ location: { ...state.location, lng: e.target.value } })} />
              </div>
              <label>Search description (max 150)</label>
              <textarea maxLength={150} value={state.search_description} onChange={(e) => update({ search_description: e.target.value })} />
              <small>{state.search_description.length}/150</small>
            </aside>
          ) : null}
        </section>
      ) : null}

      {loading ? (
        <div className="overlay">
          <div className="spinner" />
          <h2>Generating</h2>
        </div>
      ) : null}
    </main>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
