import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function GoogleSignInScreen() {
  const { signIn } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signIn();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Anmeldung fehlgeschlagen.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-slate-50 dark:bg-slate-900 p-6">

      {/* Top Section: Date & Time */}
      <div className="w-full max-w-sm pt-12 flex flex-col items-center space-y-1">
        <h2 className="text-4xl font-light text-slate-800 dark:text-slate-100 tracking-tight">
          {format(currentTime, 'HH:mm')}
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {format(currentTime, 'EEEE, d. MMMM', { locale: de })}
        </p>
        <div className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-wider">
            KW {getWeekNumber(currentTime)}
          </span>
        </div>
      </div>

      {/* Middle Section: Brand & Login */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-12">

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            SiteOs
          </h1>
        </div>

        {/* Login Button */}
        <div className="w-full space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3 text-center">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full group relative flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md text-slate-700 dark:text-slate-200 font-medium px-4 py-4 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute left-6 w-5 h-5">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            <span className="text-base">
              {loading ? 'Verbinde...' : 'Anmelden mit Google'}
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center space-y-4 opacity-40 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            SiteOs Secure Access
          </span>
        </div>
      </div>
    </div>
  );
}
