import { createClient } from '@/lib/apiClient';
import { auth } from '@/utils/auth';

export const login = async (email: string, password: string) => {
  const supabase = createClient();
  const { user } = await auth.signIn(
    email,
    password
  );

  //if (error) throw new Error(error.message);
  return user;
};

export const register = async (email: string, password: string) => {
  const supabase = createClient();
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return user;
};

export const logout = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
};