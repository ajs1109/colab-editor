// RepoNav.tsx
import { Repository } from '@/types/project';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

interface RepoNavProps {
  repo: Repository;
  currentTab: 'code' | 'commits' | 'security' | 'settings' | 'issues';
  username: string;
}

export function RepoNav({ repo, currentTab, username }: RepoNavProps) {
  const tabs = [
    { id: 'code', name: 'Code', icon: <Icons.code className="h-4 w-4" /> },
    { id: 'commits', name: 'Commits', icon: <Icons.gitCommit className="h-4 w-4" /> },
    { id: 'security', name: 'Security', icon: <Icons.shield className="h-4 w-4" /> },
    { id: 'settings', name: 'Settings', icon: <Icons.settings className="h-4 w-4" /> },
  ];

  return (
    <nav className="flex">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/${username}/${repo.name}/${tab.id === 'code' ? '' : tab.id}`}
          className={`flex items-center px-6 py-4 text-sm font-medium gap-2 border-b-2 ${currentTab === tab.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
        >
          {tab.icon}
          <span>{tab.name}</span>
        </Link>
      ))}
    </nav>
  );
}