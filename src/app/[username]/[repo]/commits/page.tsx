// app/[username]/[repo]/commits/page.tsx
import CommitHistory from '@/components/repo/CommitHistory';
import { projects } from '@/utils/projects';
import RepositoryLayout from "../repoLayout";

export default async function CommitsPage({
  params,
  searchParams,
}: {
  params: { username: string; repo: string };
  searchParams?: { page?: string };
}) {
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const commitsResponse = await projects.getCommits(params.username, params.repo, page);
  const commitsData = await commitsResponse.json();

  if (!commitsData.commits) {
    return <div>Error loading commits</div>;
  }

  // Get basic repo info for the header
  const repoResponse = await projects.getProject(params.username, params.repo);
  const repoData = await repoResponse.json();

  return (
    <RepositoryLayout repoData={repoData}>
      <div className="container py-8">       
        <div className="mt-6">
          <CommitHistory 
            commits={commitsData.commits} 
            repo={params.repo}
            username={params.username}
          />
        </div>
      </div>
    </RepositoryLayout>
  );
}