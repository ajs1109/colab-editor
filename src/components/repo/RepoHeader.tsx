// RepoHeader.tsx
import { Repository, User } from '@/types/project';
import { Icons } from '@/components/ui/icons';
import { format } from 'date-fns';
import { type Avatar, AvatarCircles } from '../magicui/avatar-circles';
import Link from 'next/link';

interface RepoHeaderProps {
  repo: Repository;
  owner: User;
  currentUser?: User;
  currentTab: 'code' | 'commits' | 'security' | 'settings';
  username: string;
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
}

export function RepoHeader({ 
  repo, 
  owner, 
  currentUser, 
  currentTab,
  username,
  permissions
}: RepoHeaderProps) {
  const isCreator = currentUser?.id === owner.id;
  const memberCount = repo.members?.length || 1;
  const creationDate = format(new Date(repo.created_at), 'MMM d, yyyy');
  const avatarUrls: Avatar[] = repo.members?.map(member => ({
    imageUrl: member.avatar_url,
    profileUrl: `/${member.username}`
  })) || [];

   const tabs = [
    { id: 'code', name: 'Code', icon: <Icons.code className="h-4 w-4" /> },
    { id: 'commits', name: 'Commits', icon: <Icons.gitCommit className="h-4 w-4" /> },
    ...(permissions.admin ? [
      { id: 'security', name: 'Security', icon: <Icons.shield className="h-4 w-4" /> },
      { id: 'settings', name: 'Settings', icon: <Icons.settings className="h-4 w-4" /> }
    ] : [])
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      {/* Top section with repo info */}
      <div className="flex items-start justify-between px-8 pt-5">
        <div className="flex items-start gap-4">
          <Icons.folder className="h-7 w-7 text-primary mt-1" />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-4">
              {owner.username} / {repo.name}
            </h1>
            <p className="text-muted-foreground">{repo.description}</p>
          </div>
        </div>
        
        {/* Right-aligned metadata */}
        <div className="flex flex-col items-end gap-2 text-sm">
          {/* Repo status */}
          {repo.is_public ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/20 rounded-full">
              <Icons.globe className="h-4 w-4" />
              <span>Public</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
              <AvatarCircles numPeople={memberCount - 3} avatarUrls={avatarUrls} />
            </div>
          )}

          {/* Creation info */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icons.calendar className="h-4 w-4" />
            <span>
              {isCreator ? 'Created by you' : `Created by ${owner.username}`} • {creationDate}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex px-2">
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
    </header>
  );
}