import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { offlineService } from '../services/offline.service';

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check sync queue
    const checkSyncQueue = () => {
      const queue = offlineService.getSyncQueue();
      setPendingSync(queue.length);
    };

    checkSyncQueue();
    const interval = setInterval(checkSyncQueue, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingSync === 0) {
    return (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-out fade-out slide-out-to-bottom-4 duration-1000 delay-[3000ms]">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl border border-white/10">
          <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Records Synced</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8">
      <div className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border-2 transition-all duration-500 ${isOnline
        ? 'bg-indigo-600/90 text-white border-indigo-400/30'
        : 'bg-amber-600/90 text-white border-amber-400/30'
        }`}>
        <div className="relative">
          {isOnline ? (
            <Wifi className="w-5 h-5" />
          ) : (
            <WifiOff className="w-5 h-5" />
          )}
          {!isOnline && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">
            {isOnline ? 'System Online' : 'Offline Mode'}
          </span>
          {pendingSync > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-xs font-bold tracking-tight">
                Pushing {pendingSync} payload{pendingSync > 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold tracking-tight opacity-70">
              {isOnline ? 'Direct synchronisation active' : 'Changes queued locally'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
