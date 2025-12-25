import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import { Loader2, Hammer, Wrench, Ruler, Component, Paintbrush, HardHat } from 'lucide-react';

export default function GoogleSignInScreen() {
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await apiService.signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  const FloatingTool = ({ Icon, delay, duration, initialTop, initialLeft, size, rotate }: any) => (
    <div
      className="absolute text-white/10 dark:text-white/5 pointer-events-none"
      style={{
        top: initialTop,
        left: initialLeft,
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <Icon size={size} />
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">

      {/* 3D Animated Background Layer */}
      <div
        className="absolute inset-0 perspective-1000"
        style={{
          transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Floating Construction Tools */}
        <FloatingTool Icon={Hammer} delay={0} duration={6} initialTop="10%" initialLeft="10%" size={64} rotate={45} />
        <FloatingTool Icon={Wrench} delay={1} duration={7} initialTop="20%" initialLeft="80%" size={80} rotate={-15} />
        <FloatingTool Icon={Ruler} delay={2} duration={8} initialTop="60%" initialLeft="15%" size={56} rotate={90} />
        <FloatingTool Icon={HardHat} delay={1.5} duration={9} initialTop="70%" initialLeft="75%" size={96} rotate={-10} />
        <FloatingTool Icon={Paintbrush} delay={0.5} duration={7.5} initialTop="15%" initialLeft="40%" size={48} rotate={30} />
        <FloatingTool Icon={Component} delay={3} duration={8.5} initialTop="85%" initialLeft="50%" size={72} rotate={0} />

        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)'
          }}
        />
      </div>

      {/* Main Content Card */}
      <div
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-500"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        <div className="flex flex-col items-center text-center space-y-8">

          {/* Logo Container */}
          <div className="relative group">
            <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
            <img
              src="/logo-new.png"
              alt="Logo"
              className="relative w-32 h-32 object-contain drop-shadow-xl transform transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Fallback if png fails, try jpg or placeholder
                const target = e.target as HTMLImageElement;
                if (target.src.includes('png')) {
                  target.src = '/logo-new.jpg';
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-wide">
              OnSite Forms
            </h1>
            <p className="text-cyan-200 font-bold text-xs uppercase tracking-[0.3em]">
              Professional Handwerker App
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-cyan-50 text-slate-900 font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-100/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-6 h-6" />
                <span>Anmelden mit Google</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
          Powered by Innofino
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
