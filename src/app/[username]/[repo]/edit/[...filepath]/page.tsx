'use client';

import { useEffect, useState } from 'react';
import { useParams, redirect } from 'next/navigation';
import { useSocket } from '@/lib/socket';
import { CollabEditor } from '@/components/repo/CollabEditor';
import { UserPresence } from '@/components/repo/UserPresence';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import EditPage from '../../fileEditor/[...filepath]/page';

export default function FileEditPa(){
  return <EditPage/>
}

export function FileEditPage() {
  const params = useParams();
  const { username, repo, filepath } = extractParams(params);
  
  const [fileContent, setFileContent] = useState('');
  const [users, setUsers] = useState<Array<{ id: string, name: string, color: string }>>([]);
  const socket = useSocket();
  const userId = socket?.id || '';

  useEffect(() => {
    if (!socket || !username || !repo || !filepath) return;

    const roomId = `${username}/${repo}/${filepath}`;

    socket.emit('join-file-room', { roomId, name: username, userId });

    const onFileContent = (content: string) => setFileContent(content);
    const onPresenceUpdate = (users: any[]) => setUsers(users);
    const onFileChanges = (changes: any) =>
      setFileContent(prev => applyTextChanges(prev, changes));

    socket.on('file-content', onFileContent);
    socket.on('presence-update', onPresenceUpdate);
    socket.on('file-changes', onFileChanges);

    return () => {
      socket.off('file-content', onFileContent);
      socket.off('presence-update', onPresenceUpdate);
      socket.off('file-changes', onFileChanges);
      socket.emit('leave-file-room', { roomId });
    };
  }, [socket, username, repo, filepath, userId]);

  const handleSave = () => {
    socket?.emit('save-file', {
      roomId: `${username}/${repo}/${filepath}`,
      content: fileContent,
    });
  };

  const handleContentChange = (changes: any[]) => {
    socket?.emit('file-changes', {
      roomId: `${username}/${repo}/${filepath}`,
      changes,
    });
  };

  if (!filepath) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => redirect(`/${username}/${repo}`)}>
            <Icons.chevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Editing: {filepath}</h1>
        </div>

        <div className="flex items-center gap-4">
          <UserPresence users={users} currentUserId={userId} />
          <Button onClick={handleSave}>
            <Icons.save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <CollabEditor
          roomId={`${username}/${repo}/${filepath}`}
          initialContent={fileContent}
          language={getLanguageFromPath(filepath)}
          userName={username}
          userId={userId}
          onContentChange={handleContentChange}
        />
      </div>

      <footer className="border-t border-border p-2 text-sm text-muted-foreground flex justify-between">
        <div>Connected: {socket?.connected ? 'Online' : 'Offline'}</div>
        <div>{users.length > 0 ? users.length : 1} user(s) editing</div>
      </footer>
    </div>
  );
}

function getLanguageFromPath(filepath: string): string {
  const extension = filepath.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'py':
      return 'python';
    case 'md':
      return 'markdown';
    default:
      return extension;
  }
}

// Helper: extract params from Next.js useParams
function extractParams(params: Record<string, any>): {
  username: string;
  repo: string;
  filepath: string;
} {
  const username = decodeURIComponent(params.username as string);
  const repo = decodeURIComponent(params.repo as string);
  const filepathParts = params.filepath as string[] | undefined;
  const filepath = decodeURIComponent(filepathParts?.join('/') || '');
  return { username, repo, filepath };
}

function applyTextChanges(content: string, changes: any[]): string {
  // Implement OT/CRDT logic if needed
  return changes.reduce((acc, change) => {
    // Placeholder logic
    return acc;
  }, content);
}
