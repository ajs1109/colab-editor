import { CommitHistory } from '@/components/repo/CommitHistory';
import { RepoHeader } from '@/components/repo/RepoHeader';
import { RepoNav } from '@/components/repo/RepoNav';
import { sampleRepo, sampleUser, sampleCommits } from '@/lib/sample-data';

export default function CommitsPage({
  params,
}: {
  params: { username: string; repo: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <RepoHeader 
        repo={sampleRepo} 
        owner={sampleUser} 
        branches={[]} 
        currentBranch={{ name: 'main', commit: sampleCommits[0], protected: false }} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RepoNav 
          repo={sampleRepo} 
          currentTab="code" 
          username={params.username} 
        />
        
        <div className="mt-6">
          <CommitHistory 
            commits={sampleCommits} 
            repo={sampleRepo} 
            username={params.username} 
          />
        </div>
      </div>
    </div>
  );
}