import { Commit } from '@/types/project';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface CommitHistoryProps {
  commits: Commit[];
  repo: { name: string };
  username: string;
}

export function CommitHistory({ commits, repo, username }: CommitHistoryProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="font-medium">
            <Icons.gitCommit className="mr-2 h-4 w-4" />
            Commits
          </Button>
          <Button variant="ghost" size="sm">
            <Icons.gitBranch className="mr-2 h-4 w-4" />
            Branches
          </Button>
        </div>
        <Button variant="ghost" size="sm">
          <Icons.history className="mr-2 h-4 w-4" />
          History
        </Button>
      </div>
      <div className="divide-y divide-gray-200">
        {commits.map((commit) => (
          <div key={commit.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={commit.author.avatar_url} />
                <AvatarFallback>{commit.author.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center">
                  <Link 
                    href={`/${username}`}
                    className="font-medium hover:underline"
                  >
                    {commit.author.username}
                  </Link>
                  <span className="mx-1">committed</span>
                  <Link 
                    href={`/${username}/${repo.name}/commit/${commit.id}`}
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {commit.id.substring(0, 7)}
                  </Link>
                </div>
                <p className="mt-1 text-sm">{commit.message}</p>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Icons.calendar className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(commit.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}