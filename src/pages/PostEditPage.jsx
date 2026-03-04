import { useEffect, useRef } from 'react';

function initLeaflet(el, location, onPick) {
  if (!window.L || !el) return null;
  const lat = Number(location.lat) || 22.0797;
  const lng = Number(location.lng) || 82.1391;
  const map = window.L.map(el).setView([lat, lng], 11);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);

  let marker = window.L.marker([lat, lng]).addTo(map);
  map.on('click', (event) => {
    const { lat: clickLat, lng: clickLng } = event.latlng;
    marker.setLatLng([clickLat, clickLng]);
    onPick({
      name: 'Bilaspur Chhattisgarh',
      lat: clickLat.toFixed(6),
      lng: clickLng.toFixed(6),
    });
  });

  return () => map.remove();
}

export default function PostEditPage({ state, update, onBack, onPublish, onSaveDraft, onUpdatePost, isExisting }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!state.showSettings) return;
    const destroy = initLeaflet(mapRef.current, state.location, (loc) => update({ location: loc }));
    return destroy;
  }, [state.showSettings, state.location, update]);

  return (
    <section className="editor-page">
      <div className="editor-topbar">
        <button className="icon-btn pulse" type="button" onClick={onBack}>↩</button>
        <input
          className="title-line"
          value={state.title}
          placeholder="Title"
          onChange={(e) => update({ title: e.target.value })}
        />
        <div className="editor-btns">
          <button className="btn dark pulse" type="button" onClick={() => update({ showSettings: !state.showSettings })}>⚙</button>
          <button className="btn dark pulse" type="button" onClick={onSaveDraft}>Save Draft</button>
          <button className="btn pulse" type="button" onClick={onPublish}>Publish</button>
          {isExisting ? <button className="btn dark pulse" type="button" onClick={onUpdatePost}>Update Post</button> : null}
        </div>
      </div>

      <div className="toolbar blogger-like">
        <button className="pulse" type="button" onClick={() => update({ editorMode: 'compose' })}>Compose View</button>
        <button className="pulse" type="button" onClick={() => update({ editorMode: 'html' })}>HTML View</button>
      </div>

      {state.editorMode === 'compose' ? (
        <div
          className="compose blogger-sheet"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => update({ content_html: e.currentTarget.innerHTML })}
          dangerouslySetInnerHTML={{ __html: state.content_html }}
        />
      ) : (
        <textarea className="html-editor blogger-sheet" value={state.content_html} onChange={(e) => update({ content_html: e.target.value })} />
      )}

      {state.showSettings ? (
        <aside className="settings-drawer">
          <h3>Post settings</h3>
          <label>Labels</label>
          <input value={state.labels.join(', ')} onChange={(e) => update({ labels: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} />
          <label>Permalink</label>
          <input value={state.slug} onChange={(e) => update({ slug: e.target.value })} />
          <label>Location</label>
          <input value={state.location.name} onChange={(e) => update({ location: { ...state.location, name: e.target.value } })} />
          <div ref={mapRef} className="leaflet-box" />
          <small>{state.location.lat}, {state.location.lng}</small>
          <label>Search description</label>
          <textarea maxLength={150} value={state.search_description} onChange={(e) => update({ search_description: e.target.value })} />
          <small>{state.search_description.length}/150</small>
        </aside>
      ) : null}
    </section>
  );
}
