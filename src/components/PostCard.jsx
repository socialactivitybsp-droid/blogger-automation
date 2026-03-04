export default function PostCard({ post, onEdit, onDelete }) {
  return (
    <article className="post-card">
      <div className="post-head">
        <h3>{post.title || 'Untitled Post'}</h3>
        <span className={`status ${post.status}`}>{post.status}</span>
      </div>
      <p>{(post.content_html || '').replace(/<[^>]+>/g, '').slice(0, 100) || 'No content yet.'}</p>
      <div className="tags">
        {post.labels?.map((label) => (
          <span key={label} className="tag">{label}</span>
        ))}
      </div>
      <small>Created: {new Date(post.createdAt).toLocaleString()}</small>
      <div className="row">
        <button type="button" className="btn secondary" onClick={onEdit}>Edit</button>
        <button type="button" className="btn danger" onClick={onDelete}>Delete</button>
      </div>
    </article>
  );
}
