import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FileText, ShieldCheck, AlertTriangle } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] px-4">
      <div className="w-full max-w-sm">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl shadow-sm mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2 tracking-tight">OnSite Forms</h1>
          <p className="text-slate-500 font-medium text-sm">Professionelle Einsatzformulare</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
              <p className="text-red-800 text-sm font-medium mb-1">{error}</p>
              {error.toLowerCase().includes('unverified') && (
                <p className="text-xs text-red-600 mt-1">
                  Klicken Sie auf "Erweitert" → "OnSite Forms besuchen (unsicher)".
                </p>
              )}
            </div>
          )}

          {/* Info about unverified app */}
          <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0" />
            <div className="space-y-1">
              <p className="text-sm text-[#92400E] font-medium">Testmodus aktiv</p>
              <p className="text-xs text-[#92400E] opacity-90 leading-relaxed">
                Falls Google "nicht verifizierte App" meldet: Klicken Sie auf "Erweitert" und dann "Zu OnSite Forms wechseln".
              </p>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full relative flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium px-4 py-3 rounded-lg transition-all active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="absolute left-4 w-5 h-5">
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
            <span className="text-sm font-medium text-[#1F2937]">
              {loading ? 'Weiterleitung zu Google...' : 'Mit Google anmelden'}
            </span>
          </button>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Mit der Anmeldung akzeptieren Sie unsere <span className="text-blue-600 font-medium cursor-pointer hover:underline">Nutzungsbedingungen</span> und <span className="text-blue-600 font-medium cursor-pointer hover:underline">Datenschutzrichtlinien</span>
          </p>

          <div className="flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Sicherer OAuth2 Zugang
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
