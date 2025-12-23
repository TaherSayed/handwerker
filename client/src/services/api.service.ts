import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { session } = useAuthStore.getState();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - sign out
      const { signOut } = useAuthStore.getState();
      await signOut();
      window.location.href = '/google-sign-in';
    }
    
    return Promise.reject(error);
  }
);

// API Service methods
export const apiService = {
  // Auth
  verifyToken: async () => {
    const response = await api.post('/auth/verify');
    return response.data;
  },

  // Contacts
  getContacts: async (searchQuery?: string) => {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await api.get('/contacts', { params });
    return response.data;
  },

  // Forms
  createForm: async (formData: any) => {
    const response = await api.post('/forms', formData);
    return response.data;
  },

  getForms: async () => {
    const response = await api.get('/forms');
    return response.data;
  },

  updateForm: async (formId: string, formData: any) => {
    const response = await api.put(`/forms/${formId}`, formData);
    return response.data;
  },

  deleteForm: async (formId: string) => {
    const response = await api.delete(`/forms/${formId}`);
    return response.data;
  },

  // Visits
  createVisit: async (visitData: any) => {
    const response = await api.post('/visits', visitData);
    return response.data;
  },

  getVisitById: async (visitId: string) => {
    const response = await api.get(`/visits/${visitId}`);
    return response.data;
  },

  updateVisit: async (visitId: string, visitData: any) => {
    const response = await api.put(`/visits/${visitId}`, visitData);
    return response.data;
  },

  // PDF
  generatePDF: async (visitId: string) => {
    const response = await api.post(`/pdf/${visitId}`);
    return response.data;
  },

  // Google (legacy endpoints - for importing contacts)
  importGoogleContacts: async (accessToken: string) => {
    const response = await api.post('/google/contacts/import', { accessToken });
    return response.data;
  },
};

export default api;

