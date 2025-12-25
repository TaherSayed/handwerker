import { Hammer, Wrench } from 'lucide-react';

export default function LoadingScreen({ text = 'Wird geladen...' }: { text?: string }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="relative mb-8">
                {/* Background glow */}
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />

                <div className="relative flex items-center justify-center w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800">
                    <div className="relative">
                        <Hammer className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-[hammer_1.5s_ease-in-out_infinite] origin-bottom-right" />
                    </div>
                </div>

                {/* Orbiting element */}
                <div className="absolute -top-2 -right-2 animate-spin duration-[3s]">
                    <div className="w-8 h-8 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-50 dark:border-slate-900">
                        <Wrench className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">{text}</h2>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                </div>
            </div>

            <style>{`
        @keyframes hammer {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-10deg); }
        }
      `}</style>
        </div>
    );
}
