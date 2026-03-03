import { signInWithGoogle, logoutAppwrite } from '../lib/appwrite';
import { signInWithPuter } from '../lib/puter';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const user = useStore((state) => state.user);
  const puterUser = useStore((state) => state.puterUser);
  const setUser = useStore((state) => state.setUser);
  const setPuterUser = useStore((state) => state.setPuterUser);

  const onGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const onLogout = async () => {
    await logoutAppwrite();
    setUser(null);
  };

  const onPuterLogin = async () => {
    try {
      const profile = await signInWithPuter();
      setPuterUser(profile || { name: 'Connected' });
    } catch {
      setPuterUser(null);
    }
  };

  return (
    <header className="navbar">
      <h1>Sociallia News Agent</h1>
      <div className="nav-right">
        <button type="button" className="btn secondary" onClick={onPuterLogin}>
          Sign in with Puter AI
        </button>
        <span className={`badge ${puterUser ? 'ok' : 'bad'}`}>{puterUser ? '● Connected' : '● Not Connected'}</span>
        {user ? (
          <>
            <div className="user-chip">
              <img src={user.prefs?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`} alt="avatar" />
              <span>{user.name}</span>
            </div>
            <button type="button" className="btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button type="button" className="btn" onClick={onGoogleLogin}>Sign in with Google</button>
        )}
      </div>
    </header>
  );
}
