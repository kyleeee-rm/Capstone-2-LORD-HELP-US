import api from "./axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  user: { id: string; name: string; email: string };
  token: string;
};

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await api.post<AuthResponse>("/auth/login", payload);
    return res.data;
  },

  register: async (payload: RegisterPayload) => {
    const res = await api.post<AuthResponse>("/auth/register", payload);
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("auth-storage");
  },
};
