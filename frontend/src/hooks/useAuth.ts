import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { fetchCurrentUser } from "@/lib/auth";
import { clearTokens, getAccessToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  hydrateFromToken: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (user) => set({ user }),
      hydrateFromToken: async () => {
        const token = getAccessToken();
        if (token) {
          try {
            const user = await fetchCurrentUser();
            set({ user, hydrated: true });
          } catch {
            clearTokens();
            set({ user: null, hydrated: true });
          }
        } else {
          set({ hydrated: true });
        }
      },
      logout: () => {
        clearTokens();
        set({ user: null });
      },
    }),
    {
      name: "silabuys-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    }
  )
);
