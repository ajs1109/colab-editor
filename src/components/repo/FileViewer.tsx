import { File } from "@/types/project";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import SyntaxHighlighter from "react-syntax-highlighter";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { commitChanges } from "@/lib/repo-client";

interface FileViewerProps {
  file: File;
  repo: { name: string; id: string };
  username: string;
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
  refreshFiles: () => Promise<void>;
  onDeleted?: () => void;
}

export function FileViewer({
  file,
  repo,
  username,
  permissions,
  refreshFiles,
  onDeleted,
}: FileViewerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const content = file.content ?? "";
  const extension = file.name.split(".").pop() || "text";
  const pathParts = file.path.split("/").filter((p) => p);
  const editHref = `/${username}/${repo.name}/edit/${pathParts.map(encodeURIComponent).join("/")}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast({ title: "Copied", description: `${file.name} copied to clipboard` });
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${file.path}? The deletion is recorded as a new commit.`)) return;
    setIsDeleting(true);
    try {
      await commitChanges(username, repo.name, `Delete ${file.path}`, [{ action: "delete", path: file.path }]);
      onDeleted?.();
      await refreshFiles();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete file",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-muted/10 border border-border rounded-lg overflow-hidden min-h-[300px]">
      <div className="flex items-center justify-between p-4 border-b border-border">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-1 text-sm min-w-0">
          <Link href={`/${username}/${repo.name}`} className="hover:text-primary hover:underline">
            {repo.name}
          </Link>
          {pathParts.map((part, i) => (
            <div key={i} className="flex items-center min-w-0">
              <Icons.chevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />
              <span className={i === pathParts.length - 1 ? "font-medium truncate" : "text-muted-foreground truncate"}>
                {part}
              </span>
            </div>
          ))}
        </div>

        {/* File actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1" onClick={handleDownload}>
            <Icons.download className="h-4 w-4" />
            Download
          </Button>

          <Button variant="ghost" size="sm" className="gap-1" onClick={handleCopy}>
            <Icons.copy className="h-4 w-4" />
            Copy
          </Button>
          {permissions.write && (
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href={editHref} className="flex text-sm gap-2">
                <Icons.edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {permissions.write && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Icons.trash className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      <div className="p-0">
        <SyntaxHighlighter
          language={extension}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: "rgba(240, 246, 252, 0.01)",
            padding: "2rem",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
