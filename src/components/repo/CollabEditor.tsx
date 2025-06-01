"use client";

import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useSocket } from '@/lib/socket';

interface CollabEditorProps {
  roomId: string;
  initialContent: string;
  language: string;
  userName: string;
  userId: string;
}

export function CollabEditor({
  roomId,
  initialContent,
  language,
  userName,
  userId,
}: CollabEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [users, setUsers] = useState<any[]>([]);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const onPresenceUpdate = (updatedUsers: any[]) => {
      setUsers(updatedUsers);
      updateRemoteCursors(updatedUsers);
    };

    const onFileChanges = (changes: any[]) => {
      if (!editorRef.current) return;

      const model = editorRef.current.getModel();
      model.pushEditOperations(
        [],
        changes.map(change => ({
          range: new monacoRef.current!.Range(
            change.range.startLineNumber,
            change.range.startColumn,
            change.range.endLineNumber,
            change.range.endColumn
          ),
          text: change.text,
        })),
        () => null
      );
    };

    socket.on('presence-update', onPresenceUpdate);
    socket.on('file-changes', onFileChanges);

    return () => {
      socket.off('presence-update', onPresenceUpdate);
      socket.off('file-changes', onFileChanges);
    };
  }, [socket]);

  const updateRemoteCursors = (users: any[]) => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations = users
      .filter(user => user.id !== userId)
      .map(user => ({
        range: new monacoRef.current!.Range(
          user.position.lineNumber,
          user.position.column,
          user.position.lineNumber,
          user.position.column
        ),
        options: {
          className: `remote-cursor-${user.id}`,
          glyphMarginClassName: `remote-cursor-glyph-${user.id}`,
          hoverMessage: {
            value: `**${user.name}** is editing`,
          },
        }
      }));

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      decorations
    );
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define theme first
    monaco.editor.defineTheme('collaborative', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e2e',
      },
    });

    // Then set theme
    monaco.editor.setTheme('collaborative');

    // Track cursor movements
    editor.onDidChangeCursorPosition((e: any) => {
      socket?.emit('cursor-update', {
        roomId,
        userId,
        position: e.position,
        selection: editor.getSelection(),
      });
    });

    editor.onDidChangeCursorSelection((e: any) => {
      socket?.emit('cursor-update', {
        roomId,
        userId,
        position: e.position,
        selection: e.selection,
      });
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      // In a real implementation, you would calculate the specific changes
      socket?.emit('file-changes', {
        roomId,
        changes: [{
          range: {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: value.split('\n').length,
            endColumn: value.split('\n').pop()?.length || 1,
          },
          text: value,
        }],
      });
    }
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark" // Set default theme here
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
          lineNumbersMinChars: 3,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}