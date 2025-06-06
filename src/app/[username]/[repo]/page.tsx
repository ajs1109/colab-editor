// app/[username]/[repo]/page.tsx
import Content from "./Content";
import RepositoryLayout from "./repoLayout";
import { getProject } from "@/utils/supabase/functions/projects";

export default async function RepositoryPage({
  params,
}: {
  params: { username: string; repo: string };
}) {
  let { username, repo } = await params;
  const repoResponse = await getProject(username, repo);
  const repoData = await repoResponse.json();
  console.log('repoData', repoData);
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