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
    return this.request('/auth/me');
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

    if (!this.isOnline()) {
      // Return cached submissions when offline
      const cached = offlineService.getCachedSubmissions();
      let filtered = cached;
      if (params?.status) {
        filtered = filtered.filter((s: any) => s.status === params.status);
      }
      if (params?.template_id) {
        filtered = filtered.filter((s: any) => s.template_id === params.template_id);
      }
      return filtered;
    }

    try {
      const data = await this.request(`/submissions${query}`) as any[];
      // Cache submissions
      offlineService.cacheSubmissions(data);
      return data;
    } catch (error: any) {
      // If request fails and we have cached data, return it
      const cached = offlineService.getCachedSubmissions();
      if (cached.length > 0) {
        console.warn('Using cached submissions due to network error');
        return cached;
      }
      throw error;
    }
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
      // Save to local storage and queue for sync
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

    try {
      const result = await this.request('/submissions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (error: any) {
      // If request fails, save as draft
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
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
      throw error;
    }
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

  // Uploads
  async getSignedUploadUrl(bucket: string, fileName: string) {
    return this.request('/uploads/signed-url', {
      method: 'POST',
      body: JSON.stringify({ bucket, file_name: fileName }),
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
