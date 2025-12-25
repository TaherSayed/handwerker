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
    <div className="flex flex-col items-center justify-between min-h-screen bg-slate-50 dark:bg-dark-background transition-colors duration-500 p-6 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-slate-200/50 dark:from-indigo-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-slate-200/50 dark:from-indigo-900/10 to-transparent pointer-events-none" />

      {/* Top Section: Date & Time */}
      <div className="w-full max-w-sm pt-20 flex flex-col items-center space-y-2 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-5xl font-thin text-slate-800 dark:text-white tracking-tighter">
          {format(currentTime, 'HH:mm')}
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-slate-500 dark:text-dark-text-muted uppercase tracking-[0.2em]">
            {format(currentTime, 'EEEE, d. MMMM', { locale: de })}
          </p>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-stroke px-2 py-0.5 rounded-full uppercase tracking-wider">
            KW {getWeekNumber(currentTime)}
          </span>
        </div>
      </div>

      {/* Middle Section: Brand & Login */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-16 relative z-10">

        {/* Brand */}
        <div className="text-center space-y-6 animate-in zoom-in-95 duration-700 delay-150">
          <div className="w-40 h-40 mx-auto bg-white dark:bg-dark-card rounded-[40px] shadow-2xl shadow-slate-200 dark:shadow-black/50 p-8 flex items-center justify-center border border-slate-100 dark:border-dark-stroke/50">
            <img
              src="/logo.jpg"
              alt="OnSite Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Login Button */}
        <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          {error && (
            <div className="bg-red-50 dark:bg-error-dark/20 border border-red-100 dark:border-error-dark/30 rounded-2xl p-4 text-center">
              <p className="text-xs font-bold text-red-600 dark:text-error-light tracking-wide">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full group relative flex items-center justify-center bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-highlight border border-slate-200 dark:border-dark-stroke text-slate-700 dark:text-white font-semibold px-4 py-5 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <div className="absolute left-6 w-6 h-6 p-0.5 bg-white rounded-full">
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
              <span className="text-sm uppercase tracking-widest pl-6">
                {loading ? 'Verbinde...' : 'Anmelden mit Google'}
              </span>
              <div className="absolute right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-slate-400 dark:text-slate-500">
                →
              </div>
            </button>
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
              Mit der Anmeldung akzeptieren Sie unsere <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2">Nutzungsbedingungen</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center space-y-4 relative z-10">
        <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600/50">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">
            OnSite Secure Access
          </span>
        </div>
      </div>
    </div>
  );
}
