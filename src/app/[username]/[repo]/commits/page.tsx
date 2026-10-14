// app/[username]/[repo]/commits/page.tsx
import CommitHistory from '@/components/repo/CommitHistory';
import { getCommits, getProject } from '@/utils/supabase/functions/projects';
import { notFound } from 'next/navigation';
import RepositoryLayout from "../repoLayout";

export default async function CommitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; repo: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { username, repo } = await params;
  const searchParam = await searchParams;
  const page = searchParam?.page ? parseInt(searchParam?.page) : 1;
  const commitsResponse = await getCommits(username, repo, page);
  const commitsData = await commitsResponse.json();

  if (!commitsData.commits) {
    return <div>Error loading commits</div>;
  }

  // Get basic repo info for the header
  const repoResponse = await getProject(username, repo);
  const repoData = await repoResponse.json();
  if (!repoData.repository) notFound();

  return (
    <RepositoryLayout repoData={repoData}>
      <div className="container py-8">       
        <div className="mt-6">
          <CommitHistory 
            commits={commitsData.commits} 
            repo={repo}
            username={username}
            members={repoData.repository.members}
          />
        </div>
      </div>
    </RepositoryLayout>
  );
}