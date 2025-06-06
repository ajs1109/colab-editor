// store/userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/project';

interface UserState {
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: IUser | null) => void;
  updateUser: (updates: Partial<IUser>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => {
        set({ user, error: null });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...updates },
            error: null 
          });
        }
      },

      clearUser: () => {
        set({ user: null, error: null, isLoading: false });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the user data, not loading states
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Selectors for better performance
export const useUser = () => useUserStore((state) => state.user);
export const useIsUserLoading = () => useUserStore((state) => state.isLoading);
export const useUserError = () => useUserStore((state) => state.error);

// Actions
export const useUserActions = () => useUserStore((state) => ({
  setUser: state.setUser,
  updateUser: state.updateUser,
  clearUser: state.clearUser,
  setLoading: state.setLoading,
  setError: state.setError,
}));