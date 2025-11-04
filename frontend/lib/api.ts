import axios from 'axios';
import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  if (auth) {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API endpoints
export const nutritionAPI = {
  getAll: (params?: { userId?: string; date?: string; limit?: number }) =>
    api.get('/api/nutrition', { params }),
  create: (data: any) => api.post('/api/nutrition', data),
  getById: (id: string) => api.get(`/api/nutrition/${id}`),
  update: (id: string, data: any) => api.put(`/api/nutrition/${id}`, data),
  delete: (id: string) => api.delete(`/api/nutrition/${id}`),
};

export const mealsAPI = {
  getAll: (params?: { userId?: string; date?: string; mealType?: string }) =>
    api.get('/api/meals', { params }),
  create: (data: any) => api.post('/api/meals', data),
  getById: (id: string) => api.get(`/api/meals/${id}`),
  update: (id: string, data: any) => api.put(`/api/meals/${id}`, data),
  delete: (id: string) => api.delete(`/api/meals/${id}`),
  upload: (formData: FormData) =>
    api.post('/api/meals/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyze: (data: { imageUrl?: string; text?: string }) =>
    api.post('/api/meals/analyze', data),
};

export const exercisesAPI = {
  getAll: (params?: { userId?: string; date?: string }) =>
    api.get('/api/exercises', { params }),
  create: (data: any) => api.post('/api/exercises', data),
  getById: (id: string) => api.get(`/api/exercises/${id}`),
  update: (id: string, data: any) => api.put(`/api/exercises/${id}`, data),
  delete: (id: string) => api.delete(`/api/exercises/${id}`),
};

export const measurementsAPI = {
  getAll: (params?: { userId?: string }) =>
    api.get('/api/measurements', { params }),
  create: (data: any) => api.post('/api/measurements', data),
  getById: (id: string) => api.get(`/api/measurements/${id}`),
  update: (id: string, data: any) => api.put(`/api/measurements/${id}`, data),
  delete: (id: string) => api.delete(`/api/measurements/${id}`),
};

export const waterAPI = {
  getToday: () => api.get('/api/water/today'),
  add: (amount: number) => api.post('/api/water', { amount }),
  getHistory: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/water/history', { params }),
};

export const goalsAPI = {
  get: () => api.get('/api/goals'),
  create: (data: any) => api.post('/api/goals', data),
  update: (data: any) => api.put('/api/goals', data),
};

export const recipesAPI = {
  getAll: (params?: { search?: string }) =>
    api.get('/api/recipes', { params }),
  create: (data: any) => api.post('/api/recipes', data),
  getById: (id: string) => api.get(`/api/recipes/${id}`),
  update: (id: string, data: any) => api.put(`/api/recipes/${id}`, data),
  delete: (id: string) => api.delete(`/api/recipes/${id}`),
};

export const fastingAPI = {
  getActive: () => api.get('/api/fasting/active'),
  start: () => api.post('/api/fasting/start'),
  stop: () => api.post('/api/fasting/stop'),
  getHistory: (params?: { limit?: number }) =>
    api.get('/api/fasting/history', { params }),
};

export const glucoseAPI = {
  import: (data: any) => api.post('/api/glucose/import', data),
  getAll: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/glucose', { params }),
};

export const benefitsAPI = {
  getAll: (params?: { category?: string }) =>
    api.get('/api/benefits', { params }),
  getById: (id: string) => api.get(`/api/benefits/${id}`),
};

export const stravaAPI = {
  connect: () => api.get('/api/integrations/strava/connect'),
  getActivities: () => api.get('/api/integrations/strava/activities'),
  sync: () => api.post('/api/integrations/strava/sync'),
};

export const userAPI = {
  get: () => api.get('/api/user'),
  update: (data: any) => api.put('/api/user', data),
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data: any) => api.put('/api/user/profile', data),
};

export const whatsappAPI = {
  getStatus: () => api.get('/api/whatsapp/status'),
  getQR: () => api.get('/api/whatsapp/qr'),
  sendMessage: (data: { to: string; message: string }) =>
    api.post('/api/whatsapp/send', data),
  getMessages: (params?: { limit?: number }) =>
    api.get('/api/whatsapp/messages', { params }),
};

export default api;

