// app/[username]/[repo]/commits/[commit_id]/page.tsx
import { CommitDetails } from '@/components/repo/CommitDetails';
import RepositoryLayout from '../../repoLayout';
import { notFound } from 'next/navigation';
import { getCommit, getProject } from '@/utils/supabase/functions/projects';

export default async function CommitPage({
  params,
}: {
  params: Promise<{ username: string; repo: string; commit_id: string }>;
}) {
  const { username, repo, commit_id } = await params;
  // Fetch commit details
  const commitResponse = await getCommit(
    username,
    repo,
    commit_id
  );
  
  if (!commitResponse.ok) {
    notFound();
  }

  const commitData = await commitResponse.json();

  // Fetch basic repo info for the header
  const repoResponse = await getProject(username, repo);
  const repoData = await repoResponse.json();
  if (!repoData.repository) notFound();

  return (
    <RepositoryLayout repoData={repoData}>
      <div className="container py-8">
        <CommitDetails
          commit={commitData.commit}
          changes={commitData.changes}
          repo={repo}
          username={username}
          permissions={repoData.permissions}
        />
      </div>
    </RepositoryLayout>
  );
}