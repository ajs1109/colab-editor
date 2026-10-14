// app/[username]/[repo]/content.tsx
"use client";

import { FileExplorer } from "@/components/repo/FileExplorer";
import { FileViewer } from "@/components/repo/FileViewer";
import { Icons } from "@/components/ui/icons";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { File } from "@/types/project";

export default function Content({
  files,
  permissions,
  repo,
  username
}: {
  files: File[];
  permissions: any;
  repo: any;
  username: string;
}) {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  // Re-render the server page so `files` reflects the latest commit.
  const refreshFiles = async () => {
    startRefresh(() => router.refresh());
  };

  // Drop the selection if the selected file no longer exists after a refresh.
  const selectedFile = files.find((file) => file.path === selectedPath && file.type === "file") ?? null;
  useEffect(() => {
    if (selectedPath && !selectedFile) setSelectedPath(null);
  }, [selectedPath, selectedFile]);

  return (
    <main className="container grid grid-cols-12 gap-8 py-8">
      <div className="col-span-12 md:col-span-3">
        <FileExplorer
          files={files}
          repo={repo}
          username={username}
          onSelectFile={(file) => setSelectedPath(file.path)}
          permissions={permissions}
          isLoading={isLoading || isRefreshing}
          setIsLoading={setIsLoading}
          refreshFiles={refreshFiles}
        />
      </div>

      <div className="col-span-12 md:col-span-9">
        {selectedFile ? (
          <FileViewer
            file={selectedFile}
            repo={repo}
            username={username}
            permissions={permissions}
            refreshFiles={refreshFiles}
            onDeleted={() => setSelectedPath(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-80 bg-muted/10 rounded-lg border border-border">
            <div className="text-center text-muted-foreground">
              <Icons.file className="mx-auto h-8 w-8 mb-2" />
              <p>Select a file to view</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
