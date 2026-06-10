import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  adminUser: { id: number; email: string; name: string } | null;
  setAuth: (user: { id: number; email: string; name: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  adminUser: null,
  setAuth: (user) => set({ isAuthenticated: true, adminUser: user }),
  logout: () => set({ isAuthenticated: false, adminUser: null }),
}));
