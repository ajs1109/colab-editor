import { Repository } from '@/types/project';
import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

interface RepoNavProps {
  repo: Repository;
  currentTab: 'code' | 'issues' | 'pull-requests' | 'actions' | 'projects' | 'security' | 'insights' | 'settings';
  username: string;
}

export function RepoNav({ repo, currentTab, username }: RepoNavProps) {
  const tabs = [
    { id: 'code', name: 'Code', icon: <Icons.code className="h-4 w-4" /> },
    { id: 'issues', name: 'Issues', icon: <Icons.alertCircle className="h-4 w-4" /> },
    { id: 'pull-requests', name: 'Pull requests', icon: <Icons.gitPullRequest className="h-4 w-4" /> },
    { id: 'actions', name: 'Actions', icon: <Icons.play className="h-4 w-4" /> },
    { id: 'projects', name: 'Projects', icon: <Icons.columns className="h-4 w-4" /> },
    { id: 'security', name: 'Security', icon: <Icons.shield className="h-4 w-4" /> },
    { id: 'insights', name: 'Insights', icon: <Icons.graph className="h-4 w-4" /> },
    { id: 'settings', name: 'Settings', icon: <Icons.settings className="h-4 w-4" /> },
  ];

  return (
    <nav className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/${username}/${repo.name}/${tab.id === 'code' ? '' : tab.id}`}
          className={`flex items-center px-4 py-3 text-sm font-medium ${currentTab === tab.id ? 'border-b-2 border-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {tab.icon}
          <span className="ml-2">{tab.name}</span>
          {tab.id === 'issues' && (
            <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              1
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}