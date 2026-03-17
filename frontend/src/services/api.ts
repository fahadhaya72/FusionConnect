import axios from 'axios';
import { refreshToken, logout } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt to refresh token automatically
      try {
        const newToken = await refreshToken();
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        // ignore
      }

      // Fallback: logout when refresh fails
      await logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
