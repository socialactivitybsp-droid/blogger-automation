import { useState } from 'react';

export default function PostDetailsPage({ state, update, onGenerateWithPuter, onNext }) {
  const [mode, setMode] = useState('title-description');
  const [seedTitle, setSeedTitle] = useState(state.title);
  const [desc, setDesc] = useState(state.search_description);

  return (
    <section className="panel">
      <h2>Post Details</h2>
      <p className="sub">Title, description and hero image before AI generation.</p>

      <div className="segmented">
        <button className={mode === 'title-description' ? 'active' : ''} type="button" onClick={() => setMode('title-description')}>Title + Description</button>
        <button className={mode === 'description-only' ? 'active' : ''} type="button" onClick={() => setMode('description-only')}>Only Description</button>
      </div>

      {mode === 'title-description' ? (
        <input value={seedTitle} onChange={(e) => setSeedTitle(e.target.value)} placeholder="Seed title" />
      ) : null}

      <textarea rows={7} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Story facts, angle, location, and context" />

      <label className="upload-box">
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => update({ heroFile: e.target.files?.[0] || null })}
        />
        <span>Upload Hero Image (Appwrite bucket)</span>
      </label>
      {state.hero_image ? <img className="hero-preview" src={state.hero_image} alt="hero" /> : null}

      <div className="panel-actions">
        <button
          className="btn pulse"
          type="button"
          onClick={() => {
            update({ title: seedTitle, search_description: desc });
            onGenerateWithPuter({ mode, seedTitle, description: desc });
          }}
        >
          Generate with Puter
        </button>
        <button
          className="btn dark pulse"
          type="button"
          onClick={() => {
            update({ title: seedTitle, search_description: desc });
            onNext();
          }}
        >
          Go to Edit Page
        </button>
      </div>
    </section>
  );
}
