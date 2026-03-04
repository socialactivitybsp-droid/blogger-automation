import { createContext, createElement, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'sociallia-news-agent';

const initialState = {
  title: '',
  content_html: '<p></p>',
  labels: [],
  slug: '',
  search_description: '',
  location: { name: '', lat: '', lng: '' },
  hero_image: '',
  blogs: [],
  posts: [],
  selectedBlogId: '',
  postId: '',
  heroFile: null,
  showSettings: true,
  editorMode: 'compose',
};

const StoreContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);

  const update = (patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(() => ({ state, update }), [state]);
  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
