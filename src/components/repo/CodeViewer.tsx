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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Icons.file className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{file.name}</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Icons.history className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="ghost" size="sm">
            <Icons.pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            <Icons.trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="ghost" size="sm">
            <Icons.raw className="mr-2 h-4 w-4" />
            Raw
          </Button>
          <Button variant="ghost" size="sm">
            <Icons.download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <div className="p-0">
        <SyntaxHighlighter
          language={extension}
          style={atomOneDark}
          showLineNumbers
          customStyle={{ margin: 0, borderRadius: 0 }}
        >
          {file.content || ''}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}