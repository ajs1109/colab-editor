"use client";

import { CommitHistory } from '@/components/repo/CommitHistory';
import { RepoHeader } from '@/components/repo/RepoHeader';
import { sampleRepo, sampleUser, sampleCommits, permissions } from '@/lib/sample-data';
import { use } from 'react';

export default function CommitsPage({
  params,
}: {
  params: Promise<{ username: string; repo: string }>;
}) {
  const { username, repo } = use(params);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RepoHeader 
        repo={sampleRepo} 
        owner={sampleUser} 
        currentUser={sampleUser} 
        currentTab="commits"
        username={username}
        permissions={permissions}
      />
      
      <div className="container py-8">       
        <div className="mt-6">
          <CommitHistory 
            commits={sampleCommits} 
            repo={sampleRepo} 
            username={username} 
          />
        </div>
      </div>
    </div>
  );
}