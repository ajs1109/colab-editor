// ReadmeViewer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface ReadmeViewerProps {
  content: string;
}

export function ReadmeViewer({ content }: ReadmeViewerProps) {
  return (
    <div className="bg-muted/10 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <Icons.fileText className="h-4 w-4" />
          <span className="font-semibold">README.md</span>
        </div>
        <Button variant="outline" className="gap-2">
          <Icons.edit className="h-4 w-4" />
          Edit
        </Button>
      </div>
      
      <div className="p-8 prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}