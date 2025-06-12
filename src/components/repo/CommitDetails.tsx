// components/repo/CommitDetails.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import FileChanges from './FileChanges';

interface CommitDetailsProps {
  commit: any;
  changes: any[];
  repo: string;
  username: string;
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
}

export function CommitDetails({
  commit,
  changes,
  repo,
  username,
  permissions,
}: CommitDetailsProps) {
  const stats = changes.reduce(
    (acc, change) => ({
      additions: acc.additions + (change.additions || 0),
      deletions: acc.deletions + (change.deletions || 0),
      files: acc.files + 1,
    }),
    { additions: 0, deletions: 0, files: 0 }
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={commit.committer?.avatar} />
            <AvatarFallback>
              {commit.committer?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{commit.message}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <span className="font-medium text-foreground">
                  {commit.committer?.name || 'Unknown'}
                </span>
                {commit.committer?.email && (
                  <span className="ml-1">&lt;{commit.committer.email}&gt;</span>
                )}
              </div>
              <div className="flex items-center">
                <Icons.calendar className="h-4 w-4 mr-1" />
                {formatDistanceToNow(new Date(commit.committed_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${username}/${repo}/commits`}>
                Back to history
              </Link>
            </Button>
            {permissions.write && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${username}/${repo}/commit/${commit.id}/revert`}>
                  Revert
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-6">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="gap-1">
              <Icons.gitCommit className="h-3 w-3" />
              {commit.id.substring(0, 7)}
            </Badge>
          </div>
          {commit.parent_commit && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-sm">Parent:</span>
              <Link
                href={`/${username}/${repo}/commit/${commit.parent_commit.id}`}
                className="text-sm text-primary hover:underline font-mono"
              >
                {commit.parent_commit.id.substring(0, 7)}
              </Link>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-green-600 text-sm">
              +{stats.additions}
            </span>
            <span className="text-red-600 text-sm">
              -{stats.deletions}
            </span>
            <span className="text-muted-foreground text-sm">
              in {stats.files} {stats.files === 1 ? 'file' : 'files'}
            </span>
          </div>
        </div>
      </div>

      <FileChanges changes={changes} repo={repo} username={username} commitId={commit.id} />
    </div>
  );
}