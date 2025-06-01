"use client";

import { FileExplorer } from "@/components/repo/FileExplorer";
import { RepoHeader } from "@/components/repo/RepoHeader";
import { FileViewer } from "@/components/repo/FileViewer";
import { sampleRepo, sampleUser, sampleBranches, sampleFiles, permissions } from "@/lib/sample-data";
import { use } from "react";
import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { File } from "@/types/project";

export default function RepositoryPage({
  params,
}: {
  params: Promise<{ username: string; repo: string }>;
}) {
  const defaultFile = sampleFiles.find(file => file.name === "README.md") || sampleFiles[0];
  const { username, repo } = use(params);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(defaultFile);

  // For now using sample data, will replace with Supabase data later
  const repository = sampleRepo;
  const owner = sampleUser;
  const branches = sampleBranches;
  const files = sampleFiles;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RepoHeader
        repo={repository}
        owner={owner}
        currentUser={owner}
        currentTab="code"
        username={username}
        permissions={permissions}
      />
      
      <main className="container grid grid-cols-12 gap-8 py-8">
        <div className="col-span-3">
          <FileExplorer
            files={files}
            repo={repository}
            username={username}
            onSelectFile={setSelectedFile}
            permissions={permissions}
          />
        </div>

        <div className="col-span-9">
          {selectedFile ? (
            <FileViewer
              file={selectedFile}
              repo={repository}
              username={username}
              permissions={permissions}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted/10 rounded-lg border border-border">
              <div className="text-center text-muted-foreground">
                <Icons.file className="mx-auto h-8 w-8 mb-2" />
                <p>Select a file to view</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}