import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Cloud } from 'lucide-react';
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
    return null; // Don't show anything when online and synced
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ${isOnline
          ? 'bg-blue-500 text-white'
          : 'bg-amber-500 text-white'
        }`}>
        {isOnline ? (
          <>
            {pendingSync > 0 ? (
              <>
                <Cloud className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">
                  Syncing {pendingSync} item{pendingSync > 1 ? 's' : ''}...
                </span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Online</span>
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              Offline {pendingSync > 0 && `(${pendingSync} pending)`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
