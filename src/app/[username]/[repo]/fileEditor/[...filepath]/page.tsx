'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, redirect } from 'next/navigation';
import { useSocket } from '@/lib/socket';
import { Blocks, RotateCcw, Share, Terminal, AlertTriangle, CheckCircle, Clock, Copy, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCodeEditorStore } from '@/stores/useCodeEditorStore';
import { defineMonacoThemes, LANGUAGE_CONFIG } from '@/constants/editor-theme';
import { Editor } from '@monaco-editor/react';

interface User {
  id: string;
  name: string;
  color: string;
  position?: any;
}

export default function EditPage() {
  const params = useParams();
  const { username, repo, filepath } = extractParams(params);
  
  const [fileContent, setFileContent] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const socket = useSocket();
  const userId = socket?.id || '';
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const { language, theme, fontSize, editor, setFontSize, setEditor } = useCodeEditorStore();

  // Set language based on file extension
  useEffect(() => {
    const extension = filepath.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'md': 'markdown',
      'html': 'html',
      'css': 'css',
      'json': 'json'
    };
    if (langMap[extension]) {
      useCodeEditorStore.setState({ language: langMap[extension] });
    }
  }, [filepath]);

  useEffect(() => {
    if (!socket || !username || !repo || !filepath) return;

    const roomId = `${username}/${repo}/${filepath}`;

    socket.emit('join-file-room', { roomId, name: username, userId });

    const onFileContent = (content: string) => {
        console.log('into onfilecontent');
      setFileContent(content);
      if (editorRef.current) {
        editorRef.current.setValue(content);
      }
    };

    const onPresenceUpdate = (users: User[]) => {
      setUsers(users);
      updateRemoteCursors(users);
    };

    const onFileChanges = (changes: any[]) => {
      if (!editorRef.current) return;

      const model = editorRef.current.getModel();
      model.pushEditOperations(
        [],
        changes.map((change) => ({
          range: new monacoRef.current.Range(
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

    const onCursorUpdate = (user: User) => {
      setUsers(prev => {
        const existing = prev.find(u => u.id === user.id);
        if (existing) {
          return prev.map(u => u.id === user.id ? { ...u, position: user.position } : u);
        }
        return [...prev, user];
      });
      updateRemoteCursors(users);
    };

    socket.on('file-content', onFileContent);
    socket.on('presence-update', onPresenceUpdate);
    socket.on('file-changes', onFileChanges);
    socket.on('cursor-update', onCursorUpdate);

    return () => {
      socket.off('file-content', onFileContent);
      socket.off('presence-update', onPresenceUpdate);
      socket.off('file-changes', onFileChanges);
      socket.off('cursor-update', onCursorUpdate);
      socket.emit('leave-file-room', { roomId });
    };
  }, [socket, username, repo, filepath, userId]);

  const updateRemoteCursors = (users: User[]) => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations = users
      .filter((user) => user.id !== userId && user.position)
      .map((user) => ({
        range: new monacoRef.current.Range(
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
        },
      }));

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      decorations
    );
  };

  const handleSave = () => {
    socket?.emit('save-file', {
      roomId: `${username}/${repo}/${filepath}`,
      content: fileContent,
    });
  };

  const handleContentChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFileContent(value);
      localStorage.setItem(`editor-code-${language}`, value);

      const changes = [{
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: value.split('\n').length,
          endColumn: value.split('\n').pop()?.length + 1 || 1,
        },
        text: value,
      }];

      socket?.emit('file-changes', {
        roomId: `${username}/${repo}/${filepath}`,
        changes,
      });
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setEditor(editor);

    defineMonacoThemes(monaco);
    monaco.editor.setTheme(theme);

    editor.onDidChangeCursorPosition((e: any) => {
      socket?.emit('cursor-update', {
        roomId: `${username}/${repo}/${filepath}`,
        userId,
        position: e.position,
        selection: editor.getSelection(),
      });
    });

    editor.onDidChangeCursorSelection((e: any) => {
      socket?.emit('cursor-update', {
        roomId: `${username}/${repo}/${filepath}`,
        userId,
        position: e.position,
        selection: e.selection,
      });
    });
  };

  const handleRefresh = () => {
  console.log('into');
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editorRef.current) editorRef.current.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
    setFileContent(defaultCode);
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem('editor-font-size', size.toString());
  };

  const handleCopy = async () => {
    if (!fileContent) return;
    await navigator.clipboard.writeText(fileContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!filepath) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto p-4">
        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center lg:justify-between justify-center bg-[#0a0a0f]/80 backdrop-blur-xl p-6 mb-4 rounded-lg">
            <div className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => redirect(`/${username}/${repo}`)} 
                className="flex items-center gap-3 group relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
                <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                  <Blocks className="size-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                <div className="flex flex-col">
                  <span className="block text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
                    {repo}
                  </span>
                  <span className="block text-xs text-blue-400/60 font-medium">
                    Editing: {filepath}
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
                  <Type className="size-4 text-gray-400" />
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={fontSize}
                      onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                      className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                      {fontSize}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
              >
                <span className="text-sm font-medium text-white">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> */}
          {/* Editor Panel */}
          <div className="relative">
            <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
                    <Image src={`/${language}.png`} alt="Logo" width={24} height={24} />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-white">Collaborative Editor</h2>
                    <p className="text-xs text-gray-500">{users.length} user(s) editing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
                  >
                    <RotateCcw className="size-4 text-gray-400" />
                  </motion.button>
                </div>
              </div>

              <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
                <Editor
                  height="600px"
                  language={language}
                  value={fileContent}
                  onChange={handleContentChange}
                  theme={theme}
                  beforeMount={defineMonacoThemes}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    renderWhitespace: "selection",
                    fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                    fontLigatures: true,
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    contextmenu: true,
                    renderLineHighlight: "all",
                    lineHeight: 1.6,
                    letterSpacing: 0.5,
                    roundedSelection: true,
                    scrollbar: {
                      verticalScrollbarSize: 8,
                      horizontalScrollbarSize: 8,
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Output Panel */}
          {/* <div className="relative bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
                  <Terminal className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-300">File Content</span>
              </div>

              {fileContent && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-300 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800/50 hover:ring-gray-700/50 transition-all"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="relative">
              <div className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] rounded-xl p-4 h-[600px] overflow-auto font-mono text-sm">
                {fileContent ? (
                  <pre className="whitespace-pre-wrap text-gray-300">{fileContent}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 ring-1 ring-gray-700/50 mb-4">
                      <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-center">Start editing to see content here...</p>
                  </div>
                )}
              </div>
            </div>
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}

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