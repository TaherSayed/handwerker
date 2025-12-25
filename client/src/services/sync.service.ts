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
            console.log('[Sync] Offline - pausing sync.');
            return;
        }

        const queue = offlineService.getSyncQueue();
        if (queue.length === 0) {
            // Nothing to sync, check again later (keep low level polling or stop)
            // We'll set a default keep-alive check of 60s if idle
            this.syncTimeout = setTimeout(() => this.startSync(), 60000);
            return;
        }

        if (!immediate && this.syncTimeout) {
            // Already scheduled
            return;
        }

        this.isSyncing = true;
        console.log(`[Sync] Processing queue (${queue.length} items)...`);

        try {
            let successCount = 0;
            let failedCount = 0;

            // Process queue sequentially to maintain order
            for (const item of queue) {
                try {
                    // Attempt sync based on type
                    if (item.action === 'create' && item.type === 'submission') {
                        // We need a specific endpoint to "sync" a draft, converting it to real submission
                        // Or primarily just call createSubmission again but force network?
                        // Actually apiService.createSubmission is smart, but we need to bypass its offline check logic
                        // to force a real request.
                        await this.processItem(item);
                    }

                    // If successful (no error thrown), remove from queue
                    offlineService.removeFromSyncQueue(item.id);
                    offlineService.removeDraft(item.data.id); // Remove the draft copy too if it exists
                    successCount++;
                } catch (err) {
                    console.error('[Sync] Item failed:', item, err);
                    failedCount++;
                    // If 5xx or Network error, stop and retry later. 
                    // If 4xx validation error, maybe remove or flag? 
                    // For now, we assume transient errors and stop.
                    break; // Stop processing rest of queue to preserve order
                }
            }

            if (failedCount > 0) {
                // Increase backoff
                this.backoffLevel++;
                const delay = this.getNextDelay();
                console.log(`[Sync] Failures detected. Backing off for ${delay}ms (Level ${this.backoffLevel})`);
                this.isSyncing = false;
                this.syncTimeout = setTimeout(() => this.startSync(), delay);
            } else {
                // All good, reset backoff
                if (successCount > 0) {
                    console.log('[Sync] Batch complete.');
                    // Notify user? "useNotificationStore" is a React hook, can't use here easily.
                    // We could dispatch a custom event.
                    window.dispatchEvent(new CustomEvent('sync-complete', { detail: { count: successCount } }));
                }
                this.resetBackoff();
                this.isSyncing = false;
                // Check again soon just in case
                this.syncTimeout = setTimeout(() => this.startSync(), 5000);
            }

        } catch (e) {
            console.error('[Sync] System error:', e);
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
