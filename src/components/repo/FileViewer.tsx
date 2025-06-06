import { File } from '@/types/project';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import Link from 'next/link';
import { EditorPanel } from './EditorPanel';
import { useState } from 'react';
import { supabase } from '@/lib/apiClient';

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
}

export function FileViewer({ file, repo, username, permissions, refreshFiles }: FileViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fileContent, setFileContent] = useState(file.content || '');
  
  const extension = file.name.split('.').pop() || 'text';
  const pathParts = file.path.split('/').filter(p => p);
  const breadcrumbs = [
    { name: repo.name, path: `/${username}/${repo.name}` },
    ...pathParts.map((part, i) => ({
      name: part,
      path: `/${username}/${repo.name}/${pathParts.slice(0, i + 1).join('/')}`
    }))
  ];

  const handleSave = async () => {
    // Save to Supabase
    const { data, error } = await supabase
      .from('files')
      .update({ content: fileContent })
      .eq('id', file.id);
    
    if (!error) {
      setIsEditing(false);
    }
  };

  if (isEditing && permissions.write) {
    return (
      <div className="bg-muted/10 border border-border rounded-lg overflow-hidden h-full min-h-[400px]">
        <EditorPanel 
          initialContent={fileContent}
          language={extension}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-muted/10 border border-border rounded-lg overflow-hidden min-h-[300px]">
      <div className="flex items-center justify-between p-4 border-b border-border">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && <Icons.chevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
              <Link 
                href={crumb.path} 
                className="hover:text-primary hover:underline"
              >
                {crumb.name}
              </Link>
            </div>
          ))}
        </div>
        
        {/* File actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1">
            <Icons.download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Icons.copy className="h-4 w-4" />
            Copy
          </Button>
          {permissions.write && (
            <Button variant='ghost' size="sm" className='gap-1'>
              <Link href={`/${username}/${repo.name}/edit/${file.path}`} className='flex text-sm gap-2'>
              <Icons.edit className="h-4 w-4" />
              Edit</Link>
            </Button>
          )}
          {permissions.write && (
            <Button variant="ghost" size="sm" className="gap-1 text-destructive">
              <Icons.trash className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-0">
        <SyntaxHighlighter
          language={extension}
          style={atomOneDark}
          showLineNumbers
          customStyle={{ 
            margin: 0, 
            borderRadius: 0,
            background: 'rgba(240, 246, 252, 0.01)',
            padding: '2rem'
          }}
        >
          {fileContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}