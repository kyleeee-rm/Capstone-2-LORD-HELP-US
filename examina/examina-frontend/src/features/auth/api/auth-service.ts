import api from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/auth-store';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

export type RegisterResponse = AuthUser & {
  created_at: string;
};

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await api.post<LoginResponse>('/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterPayload) => {
    const res = await api.post<RegisterResponse>('/auth/register', payload);
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      useAuthStore.getState().logout();
    }
  },
};
