import { useState } from 'react';

export default function PostDetailsPage({ state, onGenerateWithPuter, onNext, onHeroSelect }) {
  const [mode, setMode] = useState('title-description');
  const [seedTitle, setSeedTitle] = useState(state.title);
  const [desc, setDesc] = useState(state.search_description);

  return (
    <section className="panel details-layout">
      <div>
        <h2>Post Details</h2>
        <p className="sub">Prepare inputs and hero image before AI generation.</p>
      </div>

      <div className="details-grid">
        <div className="card-lite">
          <h3>Input Mode</h3>
          <div className="segmented">
            <button className={mode === 'title-description' ? 'active' : ''} type="button" onClick={() => setMode('title-description')}>Title + Description</button>
            <button className={mode === 'description-only' ? 'active' : ''} type="button" onClick={() => setMode('description-only')}>Only Description</button>
          </div>

          {mode === 'title-description' ? (
            <input value={seedTitle} onChange={(e) => setSeedTitle(e.target.value)} placeholder="Seed title" />
          ) : null}

          <textarea rows={8} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Story facts, angle, location, and context" />
        </div>

        <div className="card-lite">
          <h3>Hero Image</h3>
          <label className="upload-box">
            <input hidden type="file" accept="image/*" onChange={(e) => onHeroSelect(e.target.files?.[0] || null)} />
            <span>Upload image to Appwrite bucket</span>
          </label>
          {state.hero_image ? <img className="hero-preview" src={state.hero_image} alt="hero" /> : <p className="empty">No hero image selected.</p>}
        </div>
      </div>

      <div className="panel-actions">
        <button
          className="btn pulse"
          type="button"
          onClick={() => onGenerateWithPuter({ mode, seedTitle, description: desc })}
        >
          Generate with Puter
        </button>
        <button className="btn dark pulse" type="button" onClick={() => onNext({ seedTitle, description: desc })}>Continue to Editor</button>
      </div>
    </section>
  );
}
