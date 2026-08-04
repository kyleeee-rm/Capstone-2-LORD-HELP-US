import api from './client';
import { useAuthStore } from '../stores/auth-store';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

export function setupAuthInterceptor() {
  api.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = error.config?.url ?? '';
      const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
      if (error.response?.status === 401 && !isAuthEndpoint) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
}
