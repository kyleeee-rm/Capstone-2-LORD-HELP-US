import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: string | null;
  login: (user: string) => void;
  logout: () => void;
};

export const DEV_EMAIL = "dev@examina.com";
export const DEV_PASSWORD = "examina123";

const devUser = import.meta.env.DEV ? DEV_EMAIL : null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: devUser,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "auth-storage" }
  )
);
