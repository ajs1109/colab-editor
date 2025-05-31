import { createClient } from '@/lib/apiClient';

export const getUserProfile = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateUserProfile = async (userId: string, profileData: { username?: string; email?: string; avatar_url?: string }) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .update(profileData)
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};