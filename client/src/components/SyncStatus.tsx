import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { offlineService } from '../services/offline.service';

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [visible, setVisible] = useState(false);
  const [lastSynced, setLastSynced] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setVisible(true);

      // Auto-hide after 2 seconds if online and nothing pending
      if (online && pendingSync === 0) {
        setTimeout(() => setVisible(false), 2000);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const checkSyncQueue = () => {
      const queue = offlineService.getSyncQueue();
      const currentPending = queue.length;

      if (currentPending !== pendingSync) {
        setPendingSync(currentPending);
        setVisible(true);
        if (currentPending === 0) {
          setLastSynced(true);
          setTimeout(() => {
            setLastSynced(false);
            setVisible(false);
          }, 2000);
        }
      }
    };

    const interval = setInterval(checkSyncQueue, 2000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, [pendingSync]);

  if (!visible && pendingSync === 0 && !lastSynced && isOnline) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-bottom-8">
      <div className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border-2 transition-all duration-500 ${isOnline
        ? (lastSynced ? 'bg-green-600/90 border-green-400/30' : 'bg-indigo-600/90 border-indigo-400/30')
        : 'bg-amber-600/90 border-amber-400/30'
        } text-white`}>
        <div className="relative">
          {lastSynced ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : isOnline ? (
            <Wifi className="w-5 h-5 text-white" />
          ) : (
            <WifiOff className="w-5 h-5 text-white" />
          )}
          {!isOnline && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>

        <div className="flex flex-col pr-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">
            {lastSynced ? 'Synchronisiert' : isOnline ? 'System Online' : 'Offline Modus'}
          </span>
          {pendingSync > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-xs font-bold tracking-tight">
                Übertrage {pendingSync} Datensatz{pendingSync > 1 ? 'e' : ''}
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold tracking-tight opacity-70">
              {lastSynced ? 'Alle Daten gesichert' : isOnline ? 'Synchronisation aktiv' : 'Daten werden lokal gespeichert'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
