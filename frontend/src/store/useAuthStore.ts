import { create } from "zustand";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  // Call once on app mount to rehydrate from localStorage
  init: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("userToken");
    const userRaw = localStorage.getItem("user");
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as AuthUser;
        set({ user, token, isLoggedIn: true });
      } catch {
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");
      }
    }
  },

  login: (user, token) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    set({ user: null, token: null, isLoggedIn: false });
  },
}));
