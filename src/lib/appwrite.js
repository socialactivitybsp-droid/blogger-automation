import { Client, Account, OAuthProvider, Storage, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const storage = new Storage(client);

export const signInWithGoogle = () => {
  account.createOAuth2Session(OAuthProvider.Google, window.location.origin, window.location.origin);
};

export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    return null;
  }
};

export const logoutAppwrite = async () => {
  try {
    await account.deleteSession('current');
  } catch {
    // no-op
  }
};

export const uploadHeroToAppwrite = async (file) => {
  const result = await storage.createFile(import.meta.env.VITE_APPWRITE_BUCKET_ID, ID.unique(), file);
  return storage.getFileView(import.meta.env.VITE_APPWRITE_BUCKET_ID, result.$id);
};
