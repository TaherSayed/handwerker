import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FileText, ShieldCheck } from 'lucide-react';

export default function GoogleSignInScreen() {
  const { signIn } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signIn();
      // OAuth redirect will happen, so we don't need to do anything here
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800">
      <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md border border-white/20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2rem] mb-8 shadow-xl shadow-indigo-200">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter uppercase leading-none">OnSite</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Professionelle Einsatzformulare</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-[2rem] p-6 shadow-xl shadow-red-500/5 animate-in fade-in slide-in-from-top-2">
              <p className="text-red-800 text-sm font-bold tracking-tight mb-2">{error}</p>
              {error.toLowerCase().includes('unverified') && (
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest opacity-70">
                  Normal im Testmodus. Klicken Sie auf "Erweitert" → "OnSite Forms besuchen (unsicher)".
                </p>
              )}
            </div>
          )}

          {/* Info about unverified app */}
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-[2.5rem] p-6 shadow-xl shadow-indigo-500/5 items-center flex gap-4">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">⚠️</div>
            <div className="space-y-1">
              <p className="text-xs text-indigo-900 font-black uppercase tracking-widest">Testmodus</p>
              <p className="text-[10px] text-indigo-700 font-bold leading-relaxed uppercase tracking-tighter opacity-80">
                Google meldet evtl. "nicht verifizierte App". Klicken Sie auf "Erweitert" und dann "Zu OnSite Forms wechseln".
              </p>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-slate-900 border-none text-white px-8 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            {loading ? 'Anmeldung...' : 'Mit Google anmelden'}
          </button>

          {loading && (
            <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest animate-pulse">
              Weiterleitung zu Google...
            </p>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col gap-4">
          <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-tighter leading-relaxed">
            Mit der Anmeldung akzeptieren Sie unsere <span className="text-indigo-600 cursor-pointer">Nutzungsbedingungen</span> und <span className="text-indigo-600 cursor-pointer">Datenschutzrichtlinien</span>
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              Sicherer OAuth2-Zugriff auf Google Kontakte
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
