// Browser-side helper for the commit API.
import type { RepoChange } from '@/utils/supabase/repo-files';

export type { RepoChange };

export async function commitChanges(
  username: string,
  repo: string,
  message: string,
  changes: RepoChange[]
): Promise<string> {
  const response = await fetch(
    `/api/repo/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/commits`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, changes }),
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Failed to save changes');
  return data.commitId;
}
