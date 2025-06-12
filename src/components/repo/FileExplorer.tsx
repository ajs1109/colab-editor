// components/repo/FileExplorer.tsx
import { File } from "@/types/project";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  refreshFiles: () => Promise<void>;
}

export function FileExplorer({ 
  files, 
  repo, 
  username, 
  onSelectFile,
  permissions,
  isLoading,
  setIsLoading,
  refreshFiles
}: FileExplorerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [newName, setNewName] = useState("");
  const [isDirectory, setIsDirectory] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get latest commit
      const { data: commitData, error: commitError } = await supabase
        .from('commits')
        .select('id')
        .eq('project_id', repo.id)
        .order('committed_at', { ascending: false })
        .limit(1)
        .single();

      if (commitError) throw commitError;

      const fullPath = currentPath ? `${currentPath}/${newName}` : newName;

      // Create file/folder
      const { data, error } = await supabase
        .from('file_tree')
        .insert([{
          project_id: repo.id,
          commit_id: commitData.id,
          path: fullPath,
          name: newName,
          type: isDirectory ? 'dir' : 'file',
          content: isDirectory ? null : "",
          extension: isDirectory ? null : newName.split('.').pop() || '',
          mime_type: isDirectory ? null : 'text/plain'
        }])
        .select()
        .single();

      if (error) throw error;

      // Create commit for this change
      const session = await supabase.auth.getSession();
      const { error: commitCreateError } = await supabase
        .from('commits')
        .insert({
          project_id: repo.id,
          message: `Create ${isDirectory ? 'directory' : 'file'} ${fullPath}`,
          committer_id: session.data.session?.user.id,
          parent_commit_id: commitData.id
        });

      if (commitCreateError) throw commitCreateError;

      toast({
        title: "Success",
        description: `${isDirectory ? 'Folder' : 'File'} created successfully`,
      });
      setIsCreateOpen(false);
      setNewName("");
      await refreshFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async () => {
    if (!currentFile || !newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get latest commit
      const { data: commitData, error: commitError } = await supabase
        .from('commits')
        .select('id')
        .eq('project_id', repo.id)
        .order('committed_at', { ascending: false })
        .limit(1)
        .single();

      if (commitError) throw commitError;

      const parentPath = currentFile.path.split('/').slice(0, -1).join('/');
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;

      // Update file/folder
      const { error } = await supabase
        .from('file_tree')
        .update({
          name: newName,
          path: newPath,
          extension: currentFile.type === 'file' ? newName.split('.').pop() || '' : null
        })
        .eq('id', currentFile.id);

      if (error) throw error;

      // Create commit for this change
      const session = await supabase.auth.getSession();
      const { error: commitCreateError } = await supabase
        .from('commits')
        .insert({
          project_id: repo.id,
          message: `Rename ${currentFile.path} to ${newPath}`,
          committer_id: session.data.session?.user.id,
          parent_commit_id: commitData.id
        });

      if (commitCreateError) throw commitCreateError;

      toast({
        title: "Success",
        description: "Item renamed successfully",
      });
      setIsEditOpen(false);
      setNewName("");
      await refreshFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentFile) return;

    setIsLoading(true);
    try {
      // Get latest commit
      const { data: commitData, error: commitError } = await supabase
        .from('commits')
        .select('id')
        .eq('project_id', repo.id)
        .order('committed_at', { ascending: false })
        .limit(1)
        .single();

      if (commitError) throw commitError;

      // Delete file/folder
      const { error } = await supabase
        .from('file_tree')
        .delete()
        .eq('id', currentFile.id);

      if (error) throw error;

      // Create commit for this change
      const session = await supabase.auth.getSession();
      const { error: commitCreateError } = await supabase
        .from('commits')
        .insert({
          project_id: repo.id,
          message: `Delete ${currentFile.path}`,
          committer_id: session.data.session?.user.id,
          parent_commit_id: commitData.id
        });

      if (commitCreateError) throw commitCreateError;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      setIsDeleteOpen(false);
      await refreshFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (file: File) => {
    setCurrentFile(file);
    setNewName(file.name);
    setIsDirectory(file.type === 'dir');
    setIsEditOpen(true);
  };

  const openDeleteDialog = (file: File) => {
    setCurrentFile(file);
    setIsDeleteOpen(true);
  };

  const navigateToFolder = (folder: File) => {
    setCurrentPath(folder.path);
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const filteredFiles = files.filter(file => {
    const filePathParts = file.path.split('/');
    const currentPathParts = currentPath ? currentPath.split('/') : [];
    return (
      filePathParts.length === currentPathParts.length + 1 &&
      filePathParts.slice(0, -1).join('/') === currentPath
    );
  });

  return (
    <div className="bg-muted/10 border border-border rounded-lg overflow-hidden h-full flex flex-col">
      {/* Path navigation */}
      <div className="flex items-center gap-2 p-2 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateUp}
          disabled={!currentPath}
        >
          <Icons.chevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground truncate">
          {currentPath || `/${repo.name}`}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-semibold text-sm">Files</h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <Icons.refreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {permissions.write && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              disabled={isLoading}
            >
              <Icons.plus className="h-4 w-4 mr-1" />
              New
            </Button>
          )}
        </div>
      </div>

      {/* File list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <Icons.folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-medium mb-1">
              {currentPath ? "This folder is empty" : "This repository is empty"}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {permissions.write ? "Create your first file or folder" : "No files available"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredFiles.map((file) => (
              <div
                key={file.path}
                onClick={() => file.type === 'dir' ? navigateToFolder(file) : onSelectFile(file)}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                  file.type === 'dir' 
                    ? "text-muted-foreground hover:bg-muted/10" 
                    : "hover:bg-muted/10 hover:text-foreground"
                }`}
              >
                {file.type === 'dir' ? (
                  <Icons.folder className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                ) : (
                  <Icons.file className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
                <span className="truncate flex-1">{file.name}</span>
                {permissions.write && (
                  <div className="flex gap-1">
                    <button 
                      title="Rename" 
                      className="p-1 hover:bg-muted/20 rounded text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(file);
                      }}
                    >
                      <Icons.pencil className="h-3 w-3" />
                    </button>
                    <button 
                      title="Delete" 
                      className="p-1 hover:bg-muted/20 rounded text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(file);
                      }}
                    >
                      <Icons.trash className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>


      {/* Rename dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {currentFile?.type === 'dir' ? "Folder" : "File"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={`Enter new name`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleRename} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {currentFile?.type === 'dir' ? "Folder" : "File"}
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. {currentFile?.type === 'dir' ? "All contents will be deleted." : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}