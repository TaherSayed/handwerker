import { supabase } from './supabase';
import { offlineService } from './offline.service';

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.origin.includes('localhost')
    ? 'http://localhost:3000/api'
    : '/api');

class ApiService {
  private isOnline(): boolean {
    return offlineService.isOnline();
  }
  private async getAuthHeader() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const providerToken = (session as any).provider_token;

    // Debug logging for missing tokens
    if (!providerToken && window.location.pathname.includes('fill')) {
      console.warn('[API] Missing provider_token for Google Contacts. User may need to re-login.');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'X-Provider-Token': providerToken || '',
    };
  }

  // Internal logging for debugging
  private logs: any[] = [];

  private log(type: string, message: string, data?: any) {
    if (import.meta.env.DEV) {
      const entry = { timestamp: new Date(), type, message, data };
      this.logs.push(entry);
      if (this.logs.length > 100) this.logs.shift(); // Keep last 100 logs
      console.log(`[API:${type}] ${message}`, data || '');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retries = 3, timeout = 10000): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    this.log('REQ', `${options.method || 'GET'} ${url}`);

    try {
      const headers = await this.getAuthHeader();

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(id);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        // Retry logic for 5xx errors or network issues
        if (retries > 0 && (response.status >= 500 || response.status === 408)) {
          this.log('RETRY', `Retrying ${url} (${retries} left)`);
          await new Promise(res => setTimeout(res, 1000)); // Wait 1s
          return this.request(endpoint, options, retries - 1, timeout);
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            // Failed to parse JSON
          }
        } else {
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch (e) { }
        }

        this.log('ERR', errorMessage, { status: response.status });
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return null as T;
      }

      if (!isJson) {
        // Retry if we expected JSON but got HTML (often bad gateway)
        if (retries > 0) {
          this.log('RETRY', `Received non-JSON, retrying... (${retries} left)`);
          await new Promise(res => setTimeout(res, 1000));
          return this.request(endpoint, options, retries - 1, timeout);
        }
        throw new Error('Expected JSON response but received non-JSON');
      }

      const data = await response.json();
      // Simple validity check (optional, can be expanded)
      this.log('RES', `Success ${url}`, { size: JSON.stringify(data).length });
      return data;

    } catch (error: any) {
      this.log('ERR', `Request failed: ${error.message}`);

      // Handle network errors / timeouts with retry
      if (retries > 0 && (error.name === 'AbortError' || error.message.includes('Network error') || error.message.includes('fetch'))) {
        this.log('RETRY', `Network error/Timeout, retrying... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return this.request(endpoint, options, retries - 1, timeout);
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      }

      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Auth (unchanged)
  async signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts.readonly'
        }
      }
    });
  }

  async signOut() {
    return supabase.auth.signOut();
  }

  async getMe() {
    return this.request('/user/me');
  }

  async checkSchema() {
    return this.request('/user/debug-schema');
  }

  async updateCompanyInfo(data: any) {
    return this.request('/auth/company', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // User
  // async getMe() { // This was moved to Auth section
  //   return this.request('/user/me');
  // }

  async updateProfile(data: any) {
    if (import.meta.env.DEV) {
      console.log('[API] Update Profile Data:', data);
    }
    // Standardize on /user/me for profile updates
    return this.request('/user/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Templates
  async getTemplates(params?: { is_archived?: boolean }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';

    if (!this.isOnline()) {
      // Return cached templates when offline
      const cached = offlineService.getCachedTemplates();
      if (params?.is_archived !== undefined) {
        return cached.filter((t: any) => t.is_archived === params.is_archived);
      }
      return cached;
    }

    try {
      const data = await this.request(`/templates${query}`) as any[];
      // Cache templates
      offlineService.cacheTemplates(data);
      return data;
    } catch (error: any) {
      // If request fails and we have cached data, return it
      const cached = offlineService.getCachedTemplates();
      if (cached.length > 0) {
        console.warn('Using cached templates due to network error');
        return cached;
      }
      throw error;
    }
  }

  async getTemplate(id: string) {
    return this.request(`/templates/${id}`);
  }

  async createTemplate(data: any) {
    return this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, data: any) {
    return this.request(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string) {
    return this.request(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateTemplate(id: string) {
    return this.request(`/templates/${id}/duplicate`, {
      method: 'POST',
    });
  }

  // Submissions
  async getSubmissions(params?: { status?: string; template_id?: string }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    let submissions: any[] = [];

    // 1. Try Network
    if (this.isOnline()) {
      try {
        submissions = await this.request(`/submissions${query}`) as any[];
        // Cache submissions
        offlineService.cacheSubmissions(submissions);
      } catch (error: any) {
        console.warn('Network failed, using cache', error);
        submissions = offlineService.getCachedSubmissions();
      }
    } else {
      submissions = offlineService.getCachedSubmissions();
    }

    // 2. Merge with Local Drafts (Pending Sync)
    const drafts = offlineService.getDraftSubmissions();
    const draftIds = new Set(drafts.map(d => d.id));

    // Filter out submissions that are also in drafts (theoretically shouldn't happen unless ID collision)
    // But mainly we want to APPEND drafts
    const merged = [...drafts, ...submissions.filter(s => !draftIds.has(s.id))];

    // 3. Client-side filtering if we fell back to cache or merged drafts
    let filtered = merged;
    if (params?.status) {
      if (params.status === 'draft') {
        // Show both server drafts and local drafts? Or just local?
        filtered = filtered.filter((s: any) => s.status === 'draft' || s.id.toString().startsWith('draft_'));
      } else {
        filtered = filtered.filter((s: any) => s.status === params.status && !s.id.toString().startsWith('draft_'));
      }
    }
    if (params?.template_id) {
      filtered = filtered.filter((s: any) => s.template_id === params.template_id);
    }

    // Sort by date desc
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getSubmission(id: string) {
    // 1. Try to get from local drafts first (fastest)
    if (id.startsWith('draft_')) {
      const drafts = offlineService.getCachedSubmissions();
      const draft = drafts.find(s => s.id === id);
      if (draft) return draft;
    }

    // 2. Try network request
    if (this.isOnline()) {
      try {
        const data = await this.request(`/submissions/${id}`);
        return data;
      } catch (error) {
        console.warn(`[API] Failed to fetch submission ${id}, trying cache fallback.`);
      }
    }

    // 3. Fallback to cache (Offline or Network Error)
    const cached = offlineService.getCachedSubmissions();
    const found = cached.find((s: any) => s.id === id);

    if (found) {
      return {
        ...found,
        _is_cached: true // Marker for UI
      };
    }

    throw new Error('Einsatzbericht konnte nicht geladen werden (Offline & nicht im Cache).');
  }

  async createSubmission(data: any) {
    if (!this.isOnline()) {
      return this.saveOfflineDraft(data);
    }

    try {
      const result = await this.request('/submissions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (error: any) {
      // If request fails (Network/500), save as draft for sync
      if (error.message.includes('Network error') || error.message.includes('fetch') || error.message.includes('500')) {
        console.warn('[API] Submission failed, saving offline:', error);
        return this.saveOfflineDraft(data);
      }
      throw error; // Validation errors (400) should throw
    }
  }

  // Used by SyncService - throws error if fails (so backoff works), doesn't re-queue
  async syncSubmission(data: any) {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 1); // 1 retry only for sync
  }

  private saveOfflineDraft(data: any) {
    const draftSubmission = {
      ...data,
      id: `draft_${Date.now()}`,
      is_offline: true,
      created_at: new Date().toISOString(),
    };
    offlineService.saveDraftSubmission(draftSubmission);
    offlineService.addToSyncQueue('create', 'submission', data);
    return draftSubmission;
  }

  async updateSubmission(id: string, data: any) {
    return this.request(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubmission(id: string) {
    return this.request(`/submissions/${id}`, {
      method: 'DELETE',
    });
  }

  async generatePDF(id: string) {
    return this.request(`/submissions/${id}/pdf`, {
      method: 'POST',
    });
  }

  async getPDFDownloadUrl(id: string) {
    return this.request(`/submissions/${id}/download-pdf`);
  }

  async downloadAndStorePDF(submissionId: string, pdfUrl: string | Blob): Promise<string> {
    try {
      let blob: Blob;

      // If it's already a blob, use it directly
      if (pdfUrl instanceof Blob) {
        blob = pdfUrl;
      } else if (pdfUrl.startsWith('blob:')) {
        // If it's a blob URL, fetch it
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error('Failed to download PDF from blob URL');
        blob = await response.blob();
      } else {
        // Regular HTTP URL
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          // If 404, try to get signed URL from API
          if (response.status === 404) {
            try {
              const signedUrlData = await this.request(`/submissions/${submissionId}/download-pdf`) as any;
              if (signedUrlData.url) {
                const signedResponse = await fetch(signedUrlData.url);
                if (!signedResponse.ok) throw new Error('Failed to download PDF with signed URL');
                blob = await signedResponse.blob();
              } else {
                throw new Error('No signed URL available');
              }
            } catch (signedError) {
              throw new Error(`PDF nicht verfügbar: ${response.status} ${response.statusText}`);
            }
          } else {
            throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
          }
        } else {
          blob = await response.blob();
        }
      }

      // Store locally using secure storage
      const { secureStorage } = await import('./secure-storage.service');
      const fileId = `pdf_${submissionId}_${Date.now()}`;

      await secureStorage.saveFile(fileId, blob, {
        submissionId,
        type: 'pdf',
        fileName: `submission_${submissionId}.pdf`
      });

      // Update submission record with local PDF reference if it exists in local DB
      try {
        const { getDB } = await import('./db.service');
        const db = getDB();
        const submission = await db.submissions.where('uuid').equals(submissionId).first();
        if (submission && submission.id) {
          await db.submissions.update(submission.id, { pdf_url: fileId });
        }
      } catch (dbError) {
        // Ignore DB errors - submission might not be in local DB yet
        console.warn('[API] Could not update local submission record:', dbError);
      }

      console.log('[API] PDF stored locally:', fileId);
      return fileId;
    } catch (error) {
      console.error('[API] Failed to download and store PDF:', error);
      throw error;
    }
  }

  // Uploads
  async getSignedUploadUrl(bucket: string, fileName: string, contentType?: string) {
    return this.request('/uploads/signed-url', {
      method: 'POST',
      body: JSON.stringify({ bucket, file_name: fileName, content_type: contentType }),
    });
  }

  async createSubmissionPhoto(data: any) {
    return this.request('/uploads/submission-photo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Contacts
  async getContacts() {
    return this.request('/contacts');
  }
}

export const apiService = new ApiService();
