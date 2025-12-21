import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function GoogleSignInScreen() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-md w-full card p-8" style={{ borderRadius: '16px' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#0F172A', fontWeight: 600 }}>OnSite</h1>
          <p className="text-base" style={{ color: '#475569' }}>First Contact Visit App</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: '1px', color: '#DC2626' }}>
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg border-2 transition hover:bg-gray-50"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              minHeight: '48px',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium" style={{ color: '#475569' }}>Mit Google anmelden</span>
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: '1px solid #E2E8F0' }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2" style={{ backgroundColor: '#FFFFFF', color: '#475569' }}>Oder</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-4 rounded-lg border focus:outline-none transition"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderWidth: '1px',
                fontSize: '14px',
                color: '#0F172A',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB';
                e.target.style.borderWidth = '2px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.borderWidth = '1px';
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#475569' }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-4 rounded-lg border focus:outline-none transition"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderWidth: '1px',
                fontSize: '14px',
                color: '#0F172A',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB';
                e.target.style.borderWidth = '2px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.borderWidth = '1px';
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary"
          >
            {isSignUp ? 'Registrieren' : 'Anmelden'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 w-full text-sm font-medium transition hover:opacity-80"
          style={{ color: '#2563EB' }}
        >
          {isSignUp ? 'Bereits ein Konto? Anmelden' : "Noch kein Konto? Registrieren"}
        </button>
      </div>
    </div>
  );
}

