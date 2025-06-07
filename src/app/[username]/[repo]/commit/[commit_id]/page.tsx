// app/[username]/[repo]/commits/[commit_id]/page.tsx
import { CommitDetails } from '@/components/repo/CommitDetails';
import { projects } from '@/utils/projects';
import RepositoryLayout from '../../repoLayout';
import { notFound } from 'next/navigation';

export default async function CommitPage({
  params,
}: {
  params: { username: string; repo: string; commit_id: string };
}) {
  const { username, repo, commit_id } = await params;
  // Fetch commit details
  const commitResponse = await projects.getCommit(
    username,
    repo,
    commit_id
  );
  
  if (!commitResponse.ok) {
    notFound();
  }

  const commitData = await commitResponse.json();

  // Fetch basic repo info for the header
  const repoResponse = await projects.getProject(params.username, params.repo);
  const repoData = await repoResponse.json();

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