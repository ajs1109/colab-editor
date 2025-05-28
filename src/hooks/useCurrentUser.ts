import { createClient } from '@/utils/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const supabase = createClient();

// Function to fetch user details from the database
const fetchUserDetails = async (
  userId: string | null
): Promise<Partial<IUser> | null> => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar, description, links')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user details:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    avatar: data.avatar,
    description: data.description,
    links: data.links,
  };
};

export const useCurrentUser = (): {
  user: Partial<IUser> | null | undefined;
  isLoading: boolean;
} => {
  const [userId, setUserId] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || '');
      setIsAuthLoading(false);
    });
  }, []);

  // Fetch user details using React Query
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserDetails(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  return {
    user,
    isLoading: isAuthLoading || isUserLoading,
  };
};
