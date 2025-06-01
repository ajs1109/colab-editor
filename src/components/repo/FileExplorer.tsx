import { File } from "@/types/project";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/apiClient";

interface FileExplorerProps {
  files: File[];
  repo: { name: string; id: string };
  username: string;
  onSelectFile: (file: File) => void;
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
}

export function FileExplorer({ 
  files, 
  repo, 
  username, 
  onSelectFile,
  permissions 
}: FileExplorerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isDirectory, setIsDirectory] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    
    const path = ""; // Calculate path based on current directory
    
    const { data, error } = await supabase
      .from('files')
      .insert([{
        repository_id: repo.id,
        path,
        name: newName,
        is_directory: isDirectory,
        content: isDirectory ? null : ""
      }]);
    
    if (!error) {
      setIsCreateOpen(false);
      setNewName("");
    }
  };

  return (
    <div className="bg-muted/10 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Files</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => window.location.reload()}
          >
            <Icons.refreshCw className="h-4 w-4" />
          </Button>
          {permissions.write && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              <Icons.plus className="h-4 w-4 mr-2" />
              New
            </Button>
          )}
        </div>
      </div>

      <div className="py-2">
        {files.map((file) => (
          <div
            key={file.path}
            onClick={() => !file.is_directory && onSelectFile(file)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium border-l-3 cursor-pointer ${
              file.is_directory 
                ? "text-muted-foreground hover:bg-muted/10" 
                : "hover:bg-muted/10 hover:text-foreground"
            }`}
          >
            {file.is_directory ? (
              <Icons.folder className="h-4 w-4 text-yellow-500" />
            ) : (
              <Icons.file className="h-4 w-4 text-blue-500" />
            )}
            {file.name}
            {permissions.write && (
              <div className="ml-auto flex gap-1">
                <button title="Edit" className="p-1 hover:bg-muted/20 rounded">
                  <Icons.moreVertical className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create new file/folder dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {isDirectory ? "Folder" : "File"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={`Enter ${isDirectory ? "folder" : "file"} name`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1 rounded ${!isDirectory ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => setIsDirectory(false)}
              >
                File
              </button>
              <button
                className={`px-3 py-1 rounded ${isDirectory ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => setIsDirectory(true)}
              >
                Folder
              </button>
            </div>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}