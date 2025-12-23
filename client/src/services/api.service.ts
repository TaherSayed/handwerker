import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async getAuthHeader() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
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
    return this.request(`/templates${query}`);
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
    return this.request(`/submissions${query}`);
  }

  async getSubmission(id: string) {
    return this.request(`/submissions/${id}`);
  }

  async createSubmission(data: any) {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
}

export const apiService = new ApiService();
