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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers = await this.getAuthHeader();
      const url = `${API_URL}${endpoint}`;

      // Debug logging in development
      if (import.meta.env.DEV) {
        console.log(`[API] ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body as string) : '');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            // Failed to parse JSON, use default error message
          }
        } else {
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch (e) {
            // Failed to read text, use default error message
          }
        }

        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return null as T;
      }

      if (!isJson) {
        throw new Error('Expected JSON response but received non-JSON');
      }

      return await response.json();
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      }

      // Re-throw if it's already an Error with a message
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise wrap in Error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  // User
  async getMe() {
    return this.request('/user/me');
  }

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
    return this.request(`/submissions/${id}`);
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
