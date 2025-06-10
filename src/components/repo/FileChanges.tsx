// components/repo/FileChanges.tsx
import { CodeComparison } from "@/components/magicui/code-comparison";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { FileChange } from "@/types";

interface FileChangesProps {
  changes: FileChange[];
  repo: string;
  username: string;
  commitId: string;
}

const ChangeTypeIcons = {
  added: <Icons.plus className="h-4 w-4 text-green-600" />,
  modified: <Icons.pencil className="h-4 w-4 text-yellow-600" />,
  deleted: <Icons.trash className="h-4 w-4 text-red-600" />,
  renamed: <Icons.arrowRight className="h-4 w-4 text-blue-600" />,
};

const ChangeTypeBadges = {
  added: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  modified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  renamed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export default function FileChanges({ changes, repo, username, commitId }: FileChangesProps) {
  return (
    <div className="divide-y divide-border">
      {changes.map((change) => (
        <div key={change.id} className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {ChangeTypeIcons[change.change_type]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                  {change.new_path || change.old_path}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${ChangeTypeBadges[change.change_type]}`}
                >
                  {change.change_type}
                </Badge>
              </div>
              {change.change_type === 'renamed' && change.old_path && (
                <div className="text-xs text-muted-foreground mt-1">
                  Renamed from {change.old_path}
                </div>
              )}
            </div>
            <div className="flex gap-2 text-sm">
              {change.additions ? (
                <span className="text-green-600">+{change.additions}</span>
              ) : null}
              {change.deletions ? (
                <span className="text-red-600">-{change.deletions}</span>
              ) : null}
            </div>
          </div>

          {shouldShowDiff(change) && (
            <div className="mt-3 border rounded-lg overflow-hidden">
              <CodeComparison
                beforeCode={getBeforeCode(change)}
                afterCode={getAfterCode(change)}
                language={getFileLanguage(change)}
                filename={change.new_path || change.old_path || 'file'}
                lightTheme="github-light"
                darkTheme="github-dark"
                highlightColor="rgba(101, 117, 133, 0.16)"
                //className="text-sm"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Helper functions
function shouldShowDiff(change: FileChange): boolean {
  return (
    (change.change_type === 'modified') ||
    (change.change_type === 'added' && !!change.new_content) ||
    (change.change_type === 'deleted' && !!change.old_content)
  );
}

function getBeforeCode(change: FileChange): string {
  return change.change_type === 'deleted' 
    ? change.old_content || '' 
    : change.change_type === 'modified' 
      ? change.old_content || '' 
      : '';
}

function getAfterCode(change: FileChange): string {
  return change.change_type === 'added' 
    ? change.new_content || '' 
    : change.change_type === 'modified' 
      ? change.new_content || '' 
      : '';
}

function getFileLanguage(change: FileChange): string {
  const filename = change.new_path || change.old_path;
  if (!filename) return 'text';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js': case 'jsx': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'py': return 'python';
    case 'rb': return 'ruby';
    case 'go': return 'go';
    case 'java': return 'java';
    case 'php': return 'php';
    case 'css': return 'css';
    case 'scss': case 'sass': return 'scss';
    case 'less': return 'less';
    case 'html': return 'html';
    case 'json': return 'json';
    case 'yml': case 'yaml': return 'yaml';
    case 'md': return 'markdown';
    case 'sh': return 'bash';
    case 'sql': return 'sql';
    default: return 'text';
  }
}