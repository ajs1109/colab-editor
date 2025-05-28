'use client';

import BulletList from '@tiptap/extension-bullet-list';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Heading from '@tiptap/extension-heading';
import ListItem from '@tiptap/extension-list-item';
import Mention from '@tiptap/extension-mention';
import OrderedList from '@tiptap/extension-ordered-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, mergeAttributes, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import getSuggestion from './Toolbar/Mention/suggestion';
import { ToolBar } from './Toolbar/ToolBar';

interface Props {
  isEditable?: boolean;
  content: string;
  onChange: (content: string) => void;
  resetKey?: number;
  users?: Partial<IUser>[];
}

const TextEditor = ({
  isEditable = false,
  content,
  onChange,
  resetKey = 0,
  users = [],
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ListItem,
      Code.configure({
        HTMLAttributes: {
          class: 'rounded-xl px-3 py-1 bg-gray-100 dark:bg-gray-900 my-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'pl-8',
        },
      }),

      OrderedList.configure({
        HTMLAttributes: {
          class: 'pl-8',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class:
            'bg-gray-100 dark:bg-gray-900 rounded-sm p-4 border border-gray-200 dark:border-gray-800 my-2',
        },
      }),

      Mention.configure({
        HTMLAttributes: {
          class: 'text-sky-700 dark:text-sky-500',
        },
        renderHTML({ options, node }) {
          return [
            'a',
            mergeAttributes(
              { href: `/profile/${node.attrs.id}` },
              options.HTMLAttributes
            ),
            `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`,
          ];
        },
        suggestion: getSuggestion(users),
      }),
    ],
    editable: isEditable,
    content,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl px-2 pb-2 pt-3 border ${
          isEditable ? 'border-t-0' : 'border-0'
        } border-gray-200 dark:border-gray-800 rounded-b-sm ${
          isEditable ? 'min-h-[180px]' : ''
        } w-full  focus:ring-0 focus:outline-none text-xs`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && resetKey > 0) {
      editor.commands.setContent('');
    }
  }, [editor, resetKey]);

  useEffect(() => {
    editor?.setEditable(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditable]);

  return (
    <div className="w-full">
      <div>
        {isEditable && (
          <div className="bg-slate-100 dark:bg-gray-900 overflow-x-auto border rounded-t-sm">
            <ToolBar editor={editor} />
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;