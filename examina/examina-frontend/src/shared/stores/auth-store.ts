import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  expiresAt: number | null;
  setAuth: (user: AuthUser, token: string, expiresInSeconds?: number) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      setAuth: (user, token, expiresInSeconds) =>
        set({
          user,
          token,
          expiresAt:
            typeof expiresInSeconds === "number"
              ? Date.now() + expiresInSeconds * 1000
              : null,
        }),
      logout: () => set({ user: null, token: null, expiresAt: null }),
    }),
    { name: "auth-storage", version: 1 }
  )
);
