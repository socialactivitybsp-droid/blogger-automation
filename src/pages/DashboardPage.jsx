import { useMemo } from 'react';

function cleanTextFromHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstImage(html = '') {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || '';
}

export default function DashboardPage({ state, onCreate, onLoadPosts, onEditPost }) {
  const cards = useMemo(
    () =>
      state.posts.map((post) => ({
        ...post,
        preview: cleanTextFromHtml(post.content || '').slice(0, 120),
        ogImage: extractFirstImage(post.content || '') || state.hero_image,
      })),
    [state.posts, state.hero_image],
  );

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>CMS Dashboard</h2>
        <div className="panel-actions">
          <button className="btn pulse" type="button" onClick={onCreate}>+ New Post</button>
          <button className="btn dark pulse" type="button" onClick={onLoadPosts}>Refresh Posts</button>
        </div>
      </div>

      {cards.length === 0 ? <p className="empty">No posts yet. Create your first AI article.</p> : null}

      <div className="cards-grid">
        {cards.map((post) => (
          <article key={post.id} className="post-card">
            {post.ogImage ? <img src={post.ogImage} alt="OG" className="card-image" /> : null}
            <div className="card-body">
              <h3>{post.title}</h3>
              <p>{post.preview}</p>
              <small>{new Date(post.updated || post.published || '1970-01-01').toLocaleString()}</small>
              <p><b>Status:</b> {post.status || 'LIVE'}</p>
              <button className="btn dark pulse" type="button" onClick={() => onEditPost(post)}>Edit</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
