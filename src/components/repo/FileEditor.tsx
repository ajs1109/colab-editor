"use client";

import { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useSocket } from '@/lib/socket';
import { Icons } from '@/components/ui/icons';

interface FileEditorProps {
  content: string;
  language: string;
  onChange: (content: string) => void;
  remoteCursors?: Array<{
    userId: string;
    color: string;
    name: string;
    position: { lineNumber: number; column: number };
    selection?: { startLineNumber: number; endLineNumber: number; startColumn: number; endColumn: number };
  }>;
}

export function FileEditor({ content, language, onChange, remoteCursors = [] }: FileEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const socket = useSocket();

  useEffect(() => {
    // Update remote cursors and selections when they change
    if (editorRef.current && monacoRef.current && remoteCursors.length > 0) {
      const decorations = remoteCursors.map(user => {
        const range = user.selection 
          ? new monacoRef.current!.Range(
              user.selection.startLineNumber,
              user.selection.startColumn,
              user.selection.endLineNumber,
              user.selection.endColumn
            )
          : new monacoRef.current!.Range(
              user.position.lineNumber,
              user.position.column,
              user.position.lineNumber,
              user.position.column
            );

        return {
          range,
          options: {
            className: user.selection ? `remote-selection-${user.userId}` : '',
            glyphMarginClassName: `remote-cursor-${user.userId}`,
            inlineClassName: user.selection ? `remote-inline-selection-${user.userId}` : '',
            hoverMessage: {
              value: `**${user.name}** ${user.selection ? 'selecting' : 'editing'}`,
            },
            stickiness: 1, // Always on top
          }
        };
      });

      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        decorations
      );
    }

    return () => {
      if (editorRef.current && decorationsRef.current.length > 0) {
        editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    };
  }, [remoteCursors]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Setup custom styles for remote cursors and selections
    monaco.editor.defineTheme('collaborative', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {},
    });

    remoteCursors.forEach(user => {
      // Cursor style
      const cursorStyle = document.createElement('style');
      cursorStyle.innerHTML = `
        .remote-cursor-${user.userId} {
          background-color: ${user.color};
          width: 2px !important;
          margin-left: -1px;
        }
      `;
      document.head.appendChild(cursorStyle);

      // Selection style
      const selectionStyle = document.createElement('style');
      selectionStyle.innerHTML = `
        .remote-selection-${user.userId} {
          background-color: ${user.color}33;
        }
        .remote-inline-selection-${user.userId} {
          background-color: ${user.color}33;
        }
        .monaco-editor .view-overlays .current-line ~ .remote-selection-${user.userId} {
          background-color: ${user.color}66;
        }
      `;
      document.head.appendChild(selectionStyle);
    });

    // Track cursor position and selections
    editor.onDidChangeCursorPosition((e: any) => {
      socket?.emit('cursor-position', {
        position: e.position,
        selection: editor.getSelection()
      });
    });

    editor.onDidChangeCursorSelection((e: any) => {
      socket?.emit('cursor-position', {
        position: e.position,
        selection: e.selection
      });
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="h-full w-full relative">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          renderWhitespace: 'selection',
          scrollBeyondLastLine: false,
          fontFamily: "'Fira Code', monospace",
          fontLigatures: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          cursorStyle: 'line-thin',
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          tabCompletion: 'on',
          wordBasedSuggestions: 'allDocuments',
          parameterHints: { enabled: false },
          hover: { enabled: false },
          lineNumbersMinChars: 3,
          padding: { top: 16, bottom: 16 },
        }}
      />
      
      {/* Loading state */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
        <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}