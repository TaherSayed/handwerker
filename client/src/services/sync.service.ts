import { apiService } from './api.service';
import { offlineService } from './offline.service';

class SyncService {
    private isSyncing = false;
    private syncTimeout: any = null;
    private backoffLevel = 0;
    // 5s, 30s, 2min, 10min, 30min, 60min
    private backoffDelays = [5000, 30000, 120000, 600000, 1800000, 3600000];

    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('online', () => {
            console.log('[Sync] Online detected - starting immediate sync.');
            this.resetBackoff();
            this.startSync(true);
        });

        // Start initial check
        this.startSync();
    }

    private resetBackoff() {
        this.backoffLevel = 0;
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
            this.syncTimeout = null;
        }
    }

    private getNextDelay() {
        const delay = this.backoffDelays[Math.min(this.backoffLevel, this.backoffDelays.length - 1)];
        return delay;
    }

    async startSync(immediate = false) {
        if (this.isSyncing) return;

        if (!navigator.onLine) {
            console.log('[Sync] Disconnected - skipping sync attempt.');
            return;
        }

        const queue = offlineService.getSyncQueue();
        if (queue.length === 0) {
            // Check again in 2 minutes if idle
            this.syncTimeout = setTimeout(() => this.startSync(), 120000);
            return;
        }

        if (!immediate && this.syncTimeout) {
            return;
        }

        this.isSyncing = true;
        console.log(`[Sync] Syncing ${queue.length} pending items...`);

        try {
            let successCount = 0;
            let failedCount = 0;

            for (const item of queue) {
                try {
                    await this.processItem(item);

                    offlineService.removeFromSyncQueue(item.id);
                    offlineService.removeDraft(item.data.id);
                    successCount++;
                } catch (err) {
                    console.error('[Sync] Item sync failed. Stopping to preserve order.', item, err);
                    failedCount++;
                    break;
                }
            }

            if (failedCount > 0) {
                this.backoffLevel++;
                const delay = this.getNextDelay();
                console.warn(`[Sync] Batch paused early. Retrying in ${delay}ms (Backoff Level ${this.backoffLevel})`);
                this.isSyncing = false;
                this.syncTimeout = setTimeout(() => this.startSync(), delay);
            } else {
                if (successCount > 0) {
                    console.log(`[Sync] Successfully synchronized ${successCount} items.`);
                    window.dispatchEvent(new CustomEvent('sync-complete', {
                        detail: {
                            count: successCount,
                            timestamp: new Date().toISOString()
                        }
                    }));
                }
                this.resetBackoff();
                this.isSyncing = false;
                // Idle check in 10s
                this.syncTimeout = setTimeout(() => this.startSync(), 10000);
            }

        } catch (e) {
            console.error('[Sync] Fatal sync worker error:', e);
            this.isSyncing = false;
        }
    }

    private async processItem(item: any) {
        // We simply call the raw API. 
        // Since we are in SyncService, we want to bypass the "apiService.createSubmission" 
        // queue-adding logic to avoid infinite loops.
        // We'll add a specific method in ApiService for "raw" submission or access the protected request.
        // For now, we can use apiService.createSubmission but we need to ensure it tries NETWORK.
        // Since we check navigator.onLine at start, it should try network.
        // But if it fails, apiService will re-queue it! We need to handle that.
        // Actually, if apiService.createSubmission fails, it throws or queues. 
        // If it queues, we get a DUPLICATE item.
        // SOLUTION: Add a flag to createSubmission to "skipQueue".

        if (item.action === 'create' && item.type === 'submission') {
            // Use a special method or the flag
            await apiService.syncSubmission(item.data);
        }
    }
}

export const syncService = new SyncService();
