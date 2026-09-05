import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default Wi-Fi IP address detected on your system
export const DEFAULT_API_BASE_URL = 'http://10.228.242.133:8080/api';

const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 10000,
});

// Load saved server URL override from AsyncStorage if configured by user
AsyncStorage.getItem('pirate_server_url').then((savedUrl) => {
  if (savedUrl) {
    api.defaults.baseURL = savedUrl;
  }
}).catch(() => {});

// Interceptor to attach JWT bearer token
api.interceptors.request.use(
  async (config) => {
    try {
      const savedUrl = await AsyncStorage.getItem('pirate_server_url');
      if (savedUrl) {
        config.baseURL = savedUrl;
      }
      const token = await AsyncStorage.getItem('pirate_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading auth token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setServerUrl = async (url) => {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const fullUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  await AsyncStorage.setItem('pirate_server_url', fullUrl);
  api.defaults.baseURL = fullUrl;
  return fullUrl;
};

export const getServerUrl = async () => {
  const saved = await AsyncStorage.getItem('pirate_server_url');
  return saved || DEFAULT_API_BASE_URL;
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  requestResetOtp: (email) => api.post('/auth/forgot-password/request-otp', { email }),
  resetPasswordWithOtp: (data) => api.post('/auth/forgot-password/reset-password', data),
};

export const exerciseApi = {
  getAll: (muscleGroup) => api.get('/exercises', { params: { muscleGroup } }),
  getById: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
};

export const adminApi = {
  getClients: () => api.get('/admin/clients'),
  createClient: (data) => api.post('/admin/clients', data),
  deleteClient: (id) => api.delete(`/admin/clients/${id}`),
  createPlan: (data) => api.post('/admin/plans', data),
  getUserPlan: (userId) => api.get(`/admin/plans/user/${userId}`),
  getAllLogs: () => api.get('/admin/logs'),
  getUserLogs: (userId) => api.get(`/admin/logs/user/${userId}`),
  getStats: () => api.get('/admin/dashboard-stats'),
  addFeedback: (logId, feedback) => api.post(`/admin/logs/${logId}/feedback`, { coachFeedback: feedback }),
};

export const userApi = {
  getMyPlan: () => api.get('/user/active-plan'),
  getTodayWorkout: () => api.get('/user/today-workout'),
  getTodayStatus: () => api.get('/user/today-status'),
  submitLog: (data) => api.post('/user/log-workout', data),
  getHistory: () => api.get('/user/history'),
};

export default api;
