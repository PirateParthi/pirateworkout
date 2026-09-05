import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pirate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pirate_token');
      localStorage.removeItem('pirate_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
