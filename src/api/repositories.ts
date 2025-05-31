import { createClient } from '@/lib/apiClient';

export const fetchRepositories = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('repositories')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data;
};

export const fetchRepositoryById = async (repositoryId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('repositories')
    .select('*')
    .eq('id', repositoryId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const createRepository = async (repositoryData: {
  name: string;
  description: string;
  userId: string;
}) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('repositories')
    .insert([repositoryData]);

  if (error) throw new Error(error.message);
  return data;
};

export const updateRepository = async (repositoryId: string, updates: Partial<{
  name: string;
  description: string;
}>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('repositories')
    .update(updates)
    .eq('id', repositoryId);

  if (error) throw new Error(error.message);
  return data;
};

export const deleteRepository = async (repositoryId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('repositories')
    .delete()
    .eq('id', repositoryId);

  if (error) throw new Error(error.message);
  return data;
};