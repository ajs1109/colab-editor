// app/[username]/[repo]/layout.tsx
'use client';

import { RepoHeader } from '@/components/repo/RepoHeader';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export default function RepositoryLayout({
  children,
  repoData,
}: {
  children: React.ReactNode;
  repoData: {
    repository: any;
    permissions: any;
  };
}) {
  const pathname = usePathname();
  
  // Extract current tab from URL
  const currentTab = useMemo(() => {
    if (pathname?.endsWith('/commits')) return 'commits';
    if (pathname?.endsWith('/security')) return 'security';
    if (pathname?.endsWith('/settings')) return 'settings';
    if(pathname?.endsWith(`/${repoData.repository.name}`)) return 'code';
    return 'security';
  }, [pathname]);

  // Extract username from URL
  const username = useMemo(() => {
    return pathname?.split('/')[1] || '';
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RepoHeader
        repo={repoData.repository}
        owner={repoData.repository.creator}
        currentUser={repoData.repository.creator}
        currentTab={currentTab}
        username={username}
        permissions={repoData.permissions}
      />
      {children}
    </div>
  );
}