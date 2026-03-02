import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const nowIso = () => new Date().toISOString();

const defaultPostData = {
  title: '',
  content_html: '<p></p>',
  labels: [],
  slug: '',
  search_description: '',
  location: {
    name: '',
    lat: null,
    lng: null,
  },
  hero_image: '',
};

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      puterUser: null,
      posts: [],
      currentPostId: null,
      postData: defaultPostData,
      loading: false,
      setLoading: (loading) => set({ loading }),
      setUser: (user) => set({ user }),
      setPuterUser: (puterUser) => set({ puterUser }),
      resetPostData: () => set({ postData: defaultPostData, currentPostId: null }),
      updatePostData: (patch) =>
        set((state) => ({
          postData: {
            ...state.postData,
            ...patch,
          },
        })),
      updateLocation: (patch) =>
        set((state) => ({
          postData: {
            ...state.postData,
            location: {
              ...state.postData.location,
              ...patch,
            },
          },
        })),
      setLabelsFromInput: (value) => {
        const labels = value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        set((state) => ({
          postData: {
            ...state.postData,
            labels,
          },
        }));
      },
      upsertCurrentPost: (status = 'draft') => {
        const state = get();
        const timestamp = nowIso();
        if (state.currentPostId) {
          set({
            posts: state.posts.map((post) =>
              post.id === state.currentPostId
                ? {
                    ...post,
                    ...state.postData,
                    status,
                    updatedAt: timestamp,
                  }
                : post,
            ),
          });
          return state.currentPostId;
        }

        const id = crypto.randomUUID();
        const newPost = {
          id,
          ...state.postData,
          status,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        set({ posts: [newPost, ...state.posts], currentPostId: id });
        return id;
      },
      loadPostById: (id) => {
        const selected = get().posts.find((post) => post.id === id);
        if (!selected) return;
        set({
          currentPostId: id,
          postData: {
            title: selected.title,
            content_html: selected.content_html,
            labels: selected.labels,
            slug: selected.slug,
            search_description: selected.search_description,
            location: selected.location || defaultPostData.location,
            hero_image: selected.hero_image,
          },
        });
      },
      deletePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== id),
          ...(state.currentPostId === id ? { currentPostId: null, postData: defaultPostData } : {}),
        })),
    }),
    {
      name: 'sociallia-news-agent-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        puterUser: state.puterUser,
        posts: state.posts,
        currentPostId: state.currentPostId,
        postData: state.postData,
      }),
    },
  ),
);
