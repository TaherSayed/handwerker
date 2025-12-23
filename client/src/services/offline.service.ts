interface OfflineData {
  templates: any[];
  submissions: any[];
  contacts: any[];
  lastSync: number;
}

class OfflineService {
  private readonly STORAGE_KEY = 'onsite_forms_offline_data';
  private readonly SYNC_QUEUE_KEY = 'onsite_forms_sync_queue';

  // Check if online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Save data to local storage
  saveData(data: Partial<OfflineData>): void {
    try {
      const existing = this.getData();
      const updated = {
        ...existing,
        ...data,
        lastSync: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // Get data from local storage
  getData(): OfflineData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to read offline data:', error);
    }
    return {
      templates: [],
      submissions: [],
      contacts: [],
      lastSync: 0,
    };
  }

  // Add item to sync queue
  addToSyncQueue(action: 'create' | 'update' | 'delete', type: 'submission' | 'template', data: any): void {
    try {
      const queue = this.getSyncQueue();
      queue.push({
        id: `sync_${Date.now()}_${Math.random()}`,
        action,
        type,
        data,
        timestamp: Date.now(),
      });
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  // Get sync queue
  getSyncQueue(): any[] {
    try {
      const stored = localStorage.getItem(this.SYNC_QUEUE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to read sync queue:', error);
    }
    return [];
  }

  // Clear sync queue
  clearSyncQueue(): void {
    try {
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  // Remove item from sync queue
  removeFromSyncQueue(id: string): void {
    try {
      const queue = this.getSyncQueue();
      const filtered = queue.filter((item) => item.id !== id);
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  // Cache templates
  cacheTemplates(templates: any[]): void {
    this.saveData({ templates });
  }

  // Get cached templates
  getCachedTemplates(): any[] {
    return this.getData().templates;
  }

  // Cache submissions
  cacheSubmissions(submissions: any[]): void {
    this.saveData({ submissions });
  }

  // Get cached submissions
  getCachedSubmissions(): any[] {
    return this.getData().submissions;
  }

  // Cache contacts
  cacheContacts(contacts: any[]): void {
    this.saveData({ contacts });
  }

  // Get cached contacts
  getCachedContacts(): any[] {
    return this.getData().contacts;
  }

  // Save draft submission locally
  saveDraftSubmission(submission: any): void {
    try {
      const drafts = this.getDraftSubmissions();
      const existingIndex = drafts.findIndex((d) => d.id === submission.id);
      
      if (existingIndex >= 0) {
        drafts[existingIndex] = submission;
      } else {
        drafts.push(submission);
      }
      
      localStorage.setItem('onsite_forms_drafts', JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }

  // Get draft submissions
  getDraftSubmissions(): any[] {
    try {
      const stored = localStorage.getItem('onsite_forms_drafts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to read drafts:', error);
    }
    return [];
  }

  // Remove draft
  removeDraft(id: string): void {
    try {
      const drafts = this.getDraftSubmissions();
      const filtered = drafts.filter((d) => d.id !== id);
      localStorage.setItem('onsite_forms_drafts', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove draft:', error);
    }
  }

  // Clear all offline data
  clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
      localStorage.removeItem('onsite_forms_drafts');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }
}

export const offlineService = new OfflineService();

