import { FileExplorer } from '@/components/repo/FileExplorer';
import { RepoHeader } from '@/components/repo/RepoHeader';
import { RepoNav } from '@/components/repo/RepoNav';
import { CodeViewer } from '@/components/repo/CodeViewer';
import { ReadmeViewer } from '@/components/repo/ReadmeViewer';
import { sampleRepo, sampleUser, sampleBranches, sampleFiles, sampleCommits } from '@/lib/sample-data';

export default function RepositoryPage({
  params,
}: {
  params: { username: string; repo: string };
}) {
  // For now using sample data, will replace with Supabase data later
  const repository = sampleRepo;
  const owner = sampleUser;
  const branches = sampleBranches;
  const files = sampleFiles;
  const commits = sampleCommits;
  const currentBranch = branches.find(b => b.name === repository.default_branch) || branches[0];
  const readme = files.find(f => f.name.toLowerCase() === 'readme.md');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <RepoHeader 
        repo={repository} 
        owner={owner} 
        branches={branches} 
        currentBranch={currentBranch} 
      />
      
      <div className="container py-8">
        <RepoNav 
          repo={repository} 
          currentTab="code" 
          username={params.username} 
        />
        
        <div className="mt-6 grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <FileExplorer 
              files={files} 
              repo={repository} 
              username={params.username} 
              branch={currentBranch.name} 
            />
          </div>
          
          <div className="col-span-9">
            {!readme ? (
              <ReadmeViewer content={readme.content || ''} />
            ) : (
              <CodeViewer 
                file={files.find(f => f.path === 'README.md') || files[0]} 
                repo={repository} 
                username={params.username}    
                branch={currentBranch.name} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}