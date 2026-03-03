import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import StatsCard from '../components/StatsCard';
import { useStore } from '../store/useStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const posts = useStore((state) => state.posts);
  const loadPostById = useStore((state) => state.loadPostById);
  const deletePost = useStore((state) => state.deletePost);

  const stats = useMemo(() => {
    const drafts = posts.filter((post) => post.status === 'draft').length;
    const published = posts.filter((post) => post.status === 'published').length;
    return { total: posts.length, drafts, published };
  }, [posts]);

  const recent = [...posts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const comingSoon = () => window.alert('Coming Soon');

  return (
    <div className="page">
      <Navbar />
      <section className="welcome card">
        <h2>Welcome, {user?.name || 'Creator'}</h2>
        <p>Manage and generate AI-powered blog posts</p>
        <button type="button" className="btn large" onClick={() => navigate('/generate')}>+ Create Post</button>
      </section>

      <section className="stats-grid">
        <StatsCard label="Total Posts" value={stats.total} />
        <StatsCard label="Draft Posts" value={stats.drafts} />
        <StatsCard label="Published Posts" value={stats.published} />
      </section>

      <section className="card">
        <h3>Posts Overview</h3>
        {posts.length === 0 ? (
          <p>No posts yet. Create your first AI article.</p>
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={() => {
                  loadPostById(post.id);
                  navigate('/editor');
                }}
                onDelete={() => deletePost(post.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h3>Recent Activity</h3>
        <ul className="recent-list">
          {recent.map((post) => (
            <li key={post.id}>
              <span>{post.title || 'Untitled'}</span>
              <span>{new Date(post.updatedAt).toLocaleString()}</span>
              <span className={`status ${post.status}`}>{post.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card tools">
        <h3>Tools</h3>
        <div className="row">
          <button type="button" className="btn secondary" onClick={comingSoon}>Template Manager</button>
          <button type="button" className="btn secondary" onClick={comingSoon}>Analytics</button>
          <button type="button" className="btn secondary" onClick={comingSoon}>Blogger Integration</button>
        </div>
      </section>
    </div>
  );
}
