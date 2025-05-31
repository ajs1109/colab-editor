import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface ReadmeViewerProps {
  content: string;
}

export function ReadmeViewer({ content }: ReadmeViewerProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Icons.bookOpen className="h-4 w-4 text-blue-500" />
          <span className="font-medium">README.md</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Icons.pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      <div className="p-6 markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}