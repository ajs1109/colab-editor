// CodeViewer.tsx
import { File } from '@/types/project';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

interface CodeViewerProps {
  file: File;
  repo: { name: string };
  username: string;
  branch: string;
}

export function CodeViewer({ file, repo, username, branch }: CodeViewerProps) {
  const extension = file.name.split('.').pop() || 'text';

  return (
    <div className="bg-muted/10 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <Icons.file className="h-4 w-4" />
          <span className="font-semibold">{file.name}</span>
        </div>
        <Button variant="outline" className="gap-2">
          <Icons.edit className="h-4 w-4" />
          Edit
        </Button>
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
          {file.content || ''}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}