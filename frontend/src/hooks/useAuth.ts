import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";

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
        try {
          const user = await fetchCurrentUser();
          set({ user, hydrated: true });
        } catch {
          set({ user: null, hydrated: true });
        }
      },
      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // ignore
        }
        set({ user: null });
        window.location.href = "/login";
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
