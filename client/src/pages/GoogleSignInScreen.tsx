import { useState } from 'react';
import { apiService } from '../services/api.service';
import { Loader2 } from 'lucide-react';

export default function GoogleSignInScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await apiService.signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#ff7e5f] via-[#feb47b] to-[#ffeba1]">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
      />

      {/* Hexagon Logo Container */}
      <div className="relative mb-16 animate-in zoom-in duration-700">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Hexagon Shape CSS */}
          <div className="absolute inset-0 bg-white shadow-2xl skew-y-0 rotate-90 transition-transform hover:scale-105 duration-300"
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.1))'
            }}
          />
          {/* Inner Content */}
          <div className="relative z-10 flex flex-col items-center -rotate-90">
            <span className="text-4xl font-black text-[#ff7e5f] tracking-tighter">{`{OF}`}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-150">
        {/* Welcome Text */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl font-black text-white tracking-wide drop-shadow-sm">OnSite Forms</h1>
          <p className="text-white/90 font-bold text-sm tracking-[0.2em] uppercase">Professional Reports</p>
        </div>

        {/* Action Button */}
        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-[#ff7e5f] hover:bg-slate-50 font-bold text-lg py-4 rounded-[2rem] shadow-xl shadow-orange-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
              </svg>
            )}
            {loading ? 'Verbinde...' : 'Anmelden mit Google'}
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
            Powered by Innofino
          </p>
        </div>
      </div>
    </div>
  );
}
