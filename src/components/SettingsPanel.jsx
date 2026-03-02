import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import { useStore } from '../store/useStore';

function LocationSelector() {
  const location = useStore((state) => state.postData.location);
  const updateLocation = useStore((state) => state.updateLocation);

  useMapEvents({
    click(event) {
      updateLocation({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  if (!location.lat || !location.lng) return null;
  return <Marker position={[location.lat, location.lng]} />;
}

export default function SettingsPanel({ open, onClose }) {
  const postData = useStore((state) => state.postData);
  const updatePostData = useStore((state) => state.updatePostData);
  const setLabelsFromInput = useStore((state) => state.setLabelsFromInput);
  const updateLocation = useStore((state) => state.updateLocation);
  const [search, setSearch] = useState('');

  const searchLocation = async () => {
    if (!search.trim()) return;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
    const result = await response.json();
    if (result[0]) {
      updateLocation({
        name: result[0].display_name,
        lat: Number(result[0].lat),
        lng: Number(result[0].lon),
      });
    }
  };

  return (
    <aside className={`settings-panel ${open ? 'open' : ''}`}>
      <div className="panel-head">
        <h3>Post settings</h3>
        <button type="button" onClick={onClose}>✕</button>
      </div>

      <label>
        Labels
        <input value={postData.labels.join(', ')} onChange={(event) => setLabelsFromInput(event.target.value)} />
      </label>

      <label>
        Permalink
        <input value={postData.slug} onChange={(event) => updatePostData({ slug: event.target.value })} />
      </label>

      <label>
        Location
        <input
          placeholder="Search location"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') searchLocation();
          }}
        />
      </label>
      <button type="button" className="btn secondary" onClick={searchLocation}>Search Location</button>
      <small>{postData.location.name || `${postData.location.lat || '-'}, ${postData.location.lng || '-'}`}</small>

      <MapContainer center={[23.2599, 77.4126]} zoom={5} scrollWheelZoom className="map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector />
      </MapContainer>

      <label>
        Search Description
        <textarea
          maxLength={150}
          value={postData.search_description}
          onChange={(event) => updatePostData({ search_description: event.target.value })}
        />
      </label>
      <small>{postData.search_description.length}/150</small>
    </aside>
  );
}
