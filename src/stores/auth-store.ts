import { create } from "zustand";
import type {} from "zustand/middleware/persist";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: "DRIVER" | "VENDOR" | "ADMIN";
  banned?: boolean;
  approved?: boolean;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: "smart-parking-auth",
    }
  )
);
