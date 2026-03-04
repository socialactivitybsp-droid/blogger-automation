import { useEffect, useMemo, useRef, useState } from 'react';
import { StoreProvider, useStore } from './store/useStore';
import { MASTER_TEMPLATE } from './utils/masterTemplate';
import DashboardPage from './pages/DashboardPage';
import PostDetailsPage from './pages/PostDetailsPage';
import PostEditPage from './pages/PostEditPage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

function injectTemplate(hero, content) {
  return MASTER_TEMPLATE.replaceAll('{{HERO_IMAGE}}', hero || '').replace('{{CONTENT}}', content || '<p></p>');
}

function parsePuterJson(rawText) {
  const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return {
    title: parsed.title || '',
    search_description: String(parsed.search_description || '').slice(0, 150),
    slug: parsed.slug || '',
    labels: Array.isArray(parsed.labels)
      ? parsed.labels
      : String(parsed.labels || '')
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
    content_html: parsed.content_html || '<p></p>',
    location: { name: 'Bilaspur Chhattisgarh', lat: '22.0797', lng: '82.1391' },
    hero_image: parsed.hero_image || '',
  };
}

async function uploadHeroToAppwrite(file) {
  if (!file) return '';
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Invalid image file selected. Please select a proper image again.');
  }

  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
  const bucket = import.meta.env.VITE_APPWRITE_BUCKET_ID;
  const project = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  const form = new FormData();
  form.append('fileId', `hero_${Date.now()}`);
  form.append('file', file, file.name);

  const response = await fetch(`${endpoint}/storage/buckets/${bucket}/files`, {
    method: 'POST',
    headers: { 'X-Appwrite-Project': project },
    body: form,
    credentials: 'include',
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Appwrite upload failed.');
  return `${endpoint}/storage/buckets/${bucket}/files/${payload.$id}/view?project=${project}`;
}

function AppShell() {
  const { state, update, resetDraft } = useStore();
  const [page, setPage] = useState('dashboard');
  const [authConfig, setAuthConfig] = useState({ googleClientId: '', googleRedirectUri: '', missing: [] });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [puterUser, setPuterUser] = useState('Not signed in');
  const [bloggerSignedIn, setBloggerSignedIn] = useState(false);
  const heroFileRef = useRef(null);

  const bloggerOAuthUrl = useMemo(() => {
    if (!authConfig.googleClientId || !authConfig.googleRedirectUri) return '';
    const params = new URLSearchParams({
      client_id: authConfig.googleClientId,
      redirect_uri: authConfig.googleRedirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/blogger',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, [authConfig]);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/config`).then((r) => r.json()).then(setAuthConfig).catch(() => {});
    fetch(`${API_BASE}/api/auth/status`)
      .then((r) => r.json())
      .then((p) => setBloggerSignedIn(Boolean(p.bloggerSignedIn)))
      .catch(() => {});
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
        setBloggerSignedIn(true);
        setMsg('Blogger OAuth connected successfully.');
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch((error) => setMsg(`OAuth failed: ${error.message}`));
  }, []);

  const safe = async (fn) => {
    try {
      setMsg('');
      await fn();
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

  const openNewPost = () => {
    const hasUnsaved = Boolean(state.title?.trim() || state.search_description?.trim() || (state.content_html || '').replace(/<[^>]+>/g, '').trim());
    if (hasUnsaved && !state.postId) {
      const keep = window.confirm('Do you want to open previous (Unsaved) post?\nPress OK = Yes, Cancel = No (start blank).');
      if (!keep) {
        resetDraft();
      }
    }
    setPage('details');
  };

  const generateWithPuter = async ({ mode, seedTitle, description }) => {
    setLoading(true);
    try {
      let heroUrl = state.hero_image;
      if (heroFileRef.current) {
        heroUrl = await uploadHeroToAppwrite(heroFileRef.current);
      }

      const prompt = `Return STRICT JSON only with keys: title,search_description,slug,labels,hero_image,content_html,location.
Rules:
- location must always be "Bilaspur Chhattisgarh".
- search_description must be <= 150 chars.
- content_html must be full clean HTML paragraphs/headings.
mode:${mode}\nseedTitle:${seedTitle}\ndescription:${description}`;

      const ai = await window.puter.ai.chat(prompt);
      const generated = parsePuterJson(ai?.message?.content || '{}');
      const contentWithTemplate = injectTemplate(heroUrl || generated.hero_image, generated.content_html);
      update({ ...generated, hero_image: heroUrl || generated.hero_image, content_html: contentWithTemplate, showSettings: true, editorMode: 'compose', postId: '' });
      setPage('edit');
    } finally {
      setLoading(false);
    }
  };

  const publish = async (publishMode) => {
    const response = await fetch(`${API_BASE}/api/blogger/publish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogId: state.selectedBlogId, title: state.title, content: state.content_html, labels: state.labels, publishMode }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Publish failed');
    setMsg(`Success: ${payload.url}`);
    await fetchPosts();
    setPage('dashboard');
  };

  const updateExistingPost = async () => {
    const response = await fetch(`${API_BASE}/api/blogger/update`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogId: state.selectedBlogId, postId: state.postId, title: state.title, content: state.content_html, labels: state.labels }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Update failed');
    setMsg(`Updated: ${payload.url}`);
    await fetchPosts();
    setPage('dashboard');
  };

  const editPost = (post) => {
    update({
      postId: post.id,
      title: post.title || '',
      content_html: post.content || '<p></p>',
      labels: post.labels || [],
      showSettings: true,
      editorMode: 'compose',
      location: { name: 'Bilaspur Chhattisgarh', lat: '22.0797', lng: '82.1391' },
    });
    setPage('edit');
  };

  const runComposeCommand = (command, value = null) => {
    if (state.editorMode !== 'compose') return;
    const compose = document.getElementById('compose-editor');
    compose?.focus();
    if (command === 'createLink') {
      const url = window.prompt('Enter URL');
      if (!url) return;
      document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false, value);
    }
    if (compose) update({ content_html: compose.innerHTML });
  };

  const onHeroSelect = async (file) => {
    heroFileRef.current = file;
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    update({ hero_image: localUrl });
  };

  return (
    <main className="cms-shell">
      <header className="cms-header">
        <div>
          <h1>Sociallia News Agent</h1>
          <p className="sub">AI-assisted CMS for Blogger publishing</p>
        </div>
        <div className="actions">
          <a className="btn pulse" href={bloggerOAuthUrl || '#'}>
            {bloggerSignedIn ? 'Signed In to Blogger' : 'Connect Blogger OAuth'}
          </a>
          <button
            className="btn dark pulse"
            type="button"
            onClick={() => safe(async () => {
              if (!window.puter?.auth?.signIn) throw new Error('Puter.js unavailable');
              await window.puter.auth.signIn();
              const profile = await window.puter.auth.getUser?.();
              setPuterUser(profile?.username || profile?.email || profile?.name || 'Connected User');
            })}
          >
            {`Puter: ${puterUser}`}
          </button>
        </div>
      </header>

      <section className="top-controls">
        <button className="btn dark pulse" type="button" onClick={() => setPage('dashboard')}>Dashboard</button>
        <button className="btn dark pulse" type="button" onClick={openNewPost}>+ New Post</button>
        <button className="btn dark pulse" type="button" onClick={() => safe(fetchBlogs)}>Load Blogs</button>
        <select value={state.selectedBlogId} onChange={(e) => update({ selectedBlogId: e.target.value })}>
          <option value="">Select blog</option>
          {state.blogs.map((blog) => <option key={blog.id} value={blog.id}>{blog.name}</option>)}
        </select>
      </section>

      {authConfig.missing?.length ? <p className="msg">Missing backend env: {authConfig.missing.join(', ')}</p> : null}
      {msg ? <p className="msg">{msg}</p> : null}

      {page === 'dashboard' ? <DashboardPage state={state} onCreate={openNewPost} onLoadPosts={() => safe(fetchPosts)} onEditPost={editPost} /> : null}
      {page === 'details' ? <PostDetailsPage state={state} onHeroSelect={onHeroSelect} onGenerateWithPuter={(args) => safe(() => generateWithPuter(args))} onNext={({ seedTitle, description }) => { update({ title: seedTitle, search_description: description.slice(0, 150) }); setPage('edit'); }} /> : null}
      {page === 'edit' ? <PostEditPage state={state} update={update} onBack={() => setPage('details')} onPublish={() => safe(() => publish('LIVE'))} onSaveDraft={() => safe(() => publish('DRAFT'))} onUpdatePost={() => safe(updateExistingPost)} isExisting={Boolean(state.postId)} onCommand={runComposeCommand} /> : null}

      {loading ? <div className="overlay"><div className="spinner" /><h2>Generating</h2></div> : null}
    </main>
  );
}

export default function App() {
  return <StoreProvider><AppShell /></StoreProvider>;
}
