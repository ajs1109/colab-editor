// app/[username]/[repo]/content.tsx
"use client";

import { FileExplorer } from "@/components/repo/FileExplorer";
import { FileViewer } from "@/components/repo/FileViewer";
import { Icons } from "@/components/ui/icons";
import { useState } from "react";
import { getProject } from "@/utils/supabase/functions/projects";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filesList, setFilesList] = useState(files);

  const refreshFiles = async () => {
    setIsLoading(true);
    try {
      const response = await getProject(username, repo.name);
      const data = await response.json();
      console.log('frontend data:', data);
      setFilesList(data.files || []);
      if (data.files?.length > 0) {
        setSelectedFile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container grid grid-cols-12 gap-8 py-8">
      <div className="col-span-3">
        <FileExplorer
          files={filesList}
          repo={repo}
          username={username}
          onSelectFile={setSelectedFile}
          permissions={permissions}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          refreshFiles={refreshFiles}
        />
      </div>

      <div className="col-span-9">
        {selectedFile ? (
          <FileViewer
            file={selectedFile}
            repo={repo}
            username={username}
            permissions={permissions}
            refreshFiles={refreshFiles}
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