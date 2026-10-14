// app/[username]/[repo]/page.tsx
import Content from "./Content";
import RepositoryLayout from "./repoLayout";
import { getProject } from "@/utils/supabase/functions/projects";

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ username: string; repo: string }>;
}) {
  const { username, repo } = await params;
  const repoResponse = await getProject(username, repo);
  const repoData = await repoResponse.json();
  if (!repoData.repository) {
    return <div>Repository not found</div>;
  }

  return (
    <RepositoryLayout repoData={repoData}>
      <Content 
        files={repoData.files} 
        permissions={repoData.permissions} 
        repo={repoData.repository} 
        username={username}
      />
    </RepositoryLayout>
  );
}