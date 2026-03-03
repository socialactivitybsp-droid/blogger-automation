export const signInWithPuter = async () => {
  if (!window.puter?.auth?.signIn) {
    throw new Error('Puter.js not loaded.');
  }
  await window.puter.auth.signIn();
  if (window.puter.auth.getUser) {
    return window.puter.auth.getUser();
  }
  return { name: 'Puter User' };
};
