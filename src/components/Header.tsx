'use client';
import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import Link from 'next/link';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/apiClient';
import type { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { useAccessStore } from '@/stores/useAccessStore';
import { useUserStore } from '@/stores/userStore';
import { users } from '@/utils/users';

interface HeaderProps {
  className?: string;
}

const supabase = createClient();

export const Header = ({ className }: HeaderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  const setIUser = useUserStore((state) => state.setUser);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user ?? null;
      setUser(authUser);
      
      if (authUser) {
        try {
          const userData = await users.getUser(authUser.id);
          setIUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (!session) {
        useAccessStore.getState().reset(); // Reset when session ends
        setIUser(null); // Clear user store
      } else if (authUser) {
        try {
          const userData = await users.getUser(authUser.id);
          setIUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isHydrated, setIUser]);

  // Don't render anything until hydrated
  if (!isHydrated || isLoading) {
    return null; // or a loading spinner
  }

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 border-b-2 border-white bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link
          href={user ? '/projects' : '/'}
          className="flex items-center space-x-2 font-bold text-xl hover:text-primary transition-colors"
        >
          Colab Editor
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-3">
              {isLandingPage && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/create-account">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          )}
          <div className="border-l pl-4 dark:border-gray-800">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};