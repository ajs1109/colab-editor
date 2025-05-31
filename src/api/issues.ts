import { createClient } from '@/lib/apiClient';

export const fetchIssues = async (repositoryId) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('repository_id', repositoryId);

  if (error) throw new Error(error.message);
  return data;
};

export const createIssue = async (repositoryId, issueData) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .insert([{ ...issueData, repository_id: repositoryId }]);

  if (error) throw new Error(error.message);
  return data;
};

export const updateIssue = async (issueId, issueData) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .update(issueData)
    .eq('id', issueId);

  if (error) throw new Error(error.message);
  return data;
};

export const deleteIssue = async (issueId) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .delete()
    .eq('id', issueId);

  if (error) throw new Error(error.message);
  return data;
};