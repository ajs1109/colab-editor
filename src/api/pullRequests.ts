import { createClient } from '@/lib/apiClient';

export const getPullRequests = async (repositoryId) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pull_requests')
    .select('*')
    .eq('repository_id', repositoryId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createPullRequest = async (repositoryId, title, body, head, base) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pull_requests')
    .insert([{ repository_id: repositoryId, title, body, head, base }]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const mergePullRequest = async (pullRequestId) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pull_requests')
    .update({ merged: true })
    .eq('id', pullRequestId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};