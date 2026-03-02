import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { getCurrentUser } from './lib/appwrite';
import { useStore } from './store/useStore';
import App from './App';
import 'leaflet/dist/leaflet.css';
import './index.css';

function Bootstrap() {
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setUser(user);
    });
  }, [setUser]);

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Bootstrap />
    </BrowserRouter>
  </StrictMode>,
);
