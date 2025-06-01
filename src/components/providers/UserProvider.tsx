// components/providers/UserProvider.tsx
'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/apiClient';
import { users } from '@/utils/users';
import type { IUser } from '@/types';

interface UserProviderProps {
  children: React.ReactNode;
  initialUser?: IUser | null;
}

export function UserProvider({ children, initialUser }: UserProviderProps) {
  const { setUser, setLoading, setError, clearUser } = useUserStore();

  useEffect(() => {
    // Set initial user data if provided
    if (initialUser) {
      setUser(initialUser);
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);

      try {
        if (event === 'SIGNED_OUT' || !session?.user) {
          clearUser();
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Fetch user data from your users table
          const userData = await users.getUser(session.user.id);
          
          if (userData) {
            setUser(userData);
          } else {
            setError('User data not found');
          }
        }
      } catch (error) {
        console.error('Error updating user state:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialUser, setUser, setLoading, setError, clearUser]);

  return <>{children}</>;
}

// Hook for easy user data access with loading states
export function useUserWithStatus() {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}