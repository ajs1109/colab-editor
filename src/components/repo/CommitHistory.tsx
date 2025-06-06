// CommitHistory.tsx
import { Commit } from "@/types/project";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CustomAvatar from "../ui/custom-avatar";
import DateRangePicker from "../date-range-picker";

interface CommitHistoryProps {
  commits: Commit[];
  repo: string;
  username: string;
  showFullHistory?: boolean;
}

export default function CommitHistory({
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
          {/* <DateRangePicker/> */}
        </div>
      )}

      <div className="divide-y divide-border">
        {commits.map((commit) => (
          <div
            key={commit.id}
            className="p-4 hover:bg-muted/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              <CustomAvatar url={{name: commit.committer.name, imageUrl: commit.committer.avatar}}/>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1">
                  <Link
                    href={`/${username}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {commit.committer.name}
                  </Link>
                  <span className="text-muted-foreground">committed</span>
                  <Link
                    href={`/${username}/${repo}/commit/${commit.id}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {commit.id.substring(0, 7)}
                  </Link>
                </div>
                <p className="mt-1 text-sm">{commit.message}</p>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Icons.calendar className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(commit.committed_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC"
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
