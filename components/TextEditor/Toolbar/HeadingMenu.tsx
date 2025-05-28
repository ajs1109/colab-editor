import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarIconButton } from './IconButton';
import {
  ChevronDown,
  Heading,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';

const HeadingMenu = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const handleHeading1 = () => {
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  };

  const handleHeading2 = () => {
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  };

  const handleHeading3 = () => {
    editor.chain().focus().toggleHeading({ level: 3 }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1 rounded-sm flex items-center gap-0 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400">
        <Heading className="w-4 h-4" />
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={handleHeading1}
          className={cn(
            editor.isActive('heading', { level: 1 })
              ? 'bg-slate-200 dark:bg-slate-700'
              : 'bg-transparent'
          )}
        >
          <Heading1 className="w-6 h-6 mr-2" />{' '}
          <span className="text-xl">Heading 1</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleHeading2}
          className={cn(
            editor.isActive('heading', { level: 2 })
              ? 'bg-slate-200 dark:bg-slate-700'
              : 'bg-transparent'
          )}
        >
          <Heading2 className="w-5 h-5 mr-2" />{' '}
          <span className="text-lg">Heading 2</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleHeading3}
          className={cn(
            editor.isActive('heading', { level: 3 })
              ? 'bg-slate-200 dark:bg-slate-700'
              : 'bg-transparent'
          )}
        >
          <Heading3 className="w-4 h-4 mr-2" />{' '}
          <span className="text-md">Heading 3</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeadingMenu;
