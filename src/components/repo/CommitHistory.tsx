// CommitHistory.tsx
import { Commit } from "@/types/project";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CommitHistoryProps {
  commits: Commit[];
  repo: { name: string };
  username: string;
  showFullHistory?: boolean;
}

export function CommitHistory({
  commits,
  repo,
  username,
  showFullHistory = true,
}: CommitHistoryProps) {
  return (
    <>
      {showFullHistory && (
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20 h-16">
          <div className="flex items-center gap-4"></div>
          <Button
            variant="ghost"
            className={`hover:bg-muted/50 ${showFullHistory ? "hidden" : ""}`}
          >
            <Icons.history className="mr-2 h-4 w-4" />
            History {showFullHistory ? "Full" : "Recent"}
          </Button>
        </div>
      )}

      <div className="divide-y divide-border">
        {commits.map((commit) => (
          <div
            key={commit.id}
            className="p-4 hover:bg-muted/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={commit.author.avatar_url} />
                <AvatarFallback>
                  {commit.author.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1">
                  <Link
                    href={`/${username}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {commit.author.username}
                  </Link>
                  <span className="text-muted-foreground">committed</span>
                  <Link
                    href={`/${username}/${repo.name}/commit/${commit.id}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {commit.id.substring(0, 7)}
                  </Link>
                </div>
                <p className="mt-1 text-sm">{commit.message}</p>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Icons.calendar className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(commit.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
