'use client';

import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/ui/use-toast';
import { defineMonacoThemes } from '@/constants/editor-theme';
import { colorForUser, useCollaboration } from '@/hooks/useCollaboration';
import { commitChanges } from '@/lib/repo-client';
import { useCodeEditorStore } from '@/stores/useCodeEditorStore';
import { Editor, type OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import { motion } from 'framer-motion';
import { Blocks, Lock, RotateCcw, Type } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

// File extension -> Monaco language id.
const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python', java: 'java', go: 'go', rs: 'rust', rb: 'ruby', swift: 'swift',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'cpp', c: 'c',
  cs: 'csharp', php: 'php', kt: 'kotlin', scala: 'scala', sql: 'sql',
  sh: 'shell', bash: 'shell', yml: 'yaml', yaml: 'yaml', xml: 'xml',
  md: 'markdown', html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less', json: 'json',
};

// Languages with a logo in /public.
const LANGUAGE_LOGOS = new Set(['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'ruby', 'swift', 'cpp', 'csharp']);

interface EditPageProps {
  username: string;
  repo: string;
  projectId: string;
  filepath: string;
  file: string;
  canEdit: boolean;
  currentUser: { id: string; name: string; avatar: string | null };
}

export default function EditPage({ username, repo, projectId, filepath, file, canEdit, currentUser }: EditPageProps) {
  const { theme, fontSize, setFontSize } = useCodeEditorStore();
  const { toast } = useToast();

  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const baselineRef = useRef(file);

  const extension = filepath.split('.').pop()?.toLowerCase() || '';
  const language = LANGUAGE_BY_EXTENSION[extension] || 'plaintext';

  const updateDirty = useCallback(() => {
    const value = editor?.getModel()?.getValue();
    if (value !== undefined) setIsDirty(value !== baselineRef.current);
  }, [editor]);

  const { clientId, collaborators, isConnected, announceSave } = useCollaboration({
    roomId: `${projectId}:${filepath}`,
    user: currentUser,
    editor,
    onRemoteSave: ({ content, by }) => {
      baselineRef.current = content;
      updateDirty();
      toast({ title: 'Saved', description: `${by} committed changes to ${filepath}` });
    },
  });

  const save = useCallback(async () => {
    const model = editor?.getModel();
    if (!model || !canEdit || isSaving) return;

    const content = model.getValue();
    if (content === baselineRef.current) {
      toast({ title: 'Nothing to save', description: 'The file has no changes.' });
      return;
    }

    setIsSaving(true);
    try {
      const commitId = await commitChanges(username, repo, commitMessage.trim() || `Update ${filepath}`, [
        { action: 'update', path: filepath, content },
      ]);
      baselineRef.current = content;
      updateDirty();
      setCommitMessage('');
      announceSave(content, commitId);
      toast({ title: 'Changes committed', description: `Saved ${filepath}` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Could not save the file',
      });
    } finally {
      setIsSaving(false);
    }
  }, [editor, canEdit, isSaving, username, repo, commitMessage, filepath, announceSave, updateDirty, toast]);

  // Keep the Ctrl/Cmd+S binding pointed at the latest save callback.
  const saveRef = useRef(save);
  saveRef.current = save;

  const handleMount: OnMount = (mountedEditor, monaco) => {
    mountedEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => saveRef.current());
    setEditor(mountedEditor);
  };

  useEffect(() => {
    if (!editor) return;
    const subscription = editor.onDidChangeModelContent(updateDirty);
    return () => subscription.dispose();
  }, [editor, updateDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  // Revert to the last committed version. Done as an edit (not setValue) so the
  // revert is broadcast to collaborators and stays undoable.
  const handleReset = () => {
    const model = editor?.getModel();
    if (!model) return;
    editor!.executeEdits('reset', [{ range: model.getFullModelRange(), text: baselineRef.current }]);
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(Math.min(Math.max(newSize, 12), 24));
  };

  const others = collaborators.filter((c) => c.clientId !== clientId);
  const editingCount = Math.max(collaborators.length, 1);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto p-4">
        {/* Header */}
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-4 lg:justify-between justify-center bg-[#0a0a0f]/80 backdrop-blur-xl p-6 mb-4 rounded-lg">
            <Link href={`/${username}/${repo}`} className="flex items-center gap-3 group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
              <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                <Blocks className="size-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="block text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
                  {repo}
                </span>
                <span className="block text-xs text-blue-400/60 font-medium">
                  {canEdit ? 'Editing' : 'Viewing'}: {filepath}
                </span>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
                <Type className="size-4 text-gray-400" />
                <input
                  aria-label="Font size"
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">{fontSize}</span>
              </div>

              {canEdit ? (
                <>
                  <input
                    aria-label="Commit message"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                    placeholder={`Update ${filepath.split('/').pop()}`}
                    className="w-56 px-3 py-2 text-sm bg-[#1e1e2e] text-gray-200 placeholder:text-gray-500 rounded-lg ring-1 ring-white/5 focus:outline-none focus:ring-blue-500/50"
                  />
                  <button
                    onClick={save}
                    disabled={!isDirty || isSaving}
                    title="Commit changes (Ctrl/Cmd+S)"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm font-medium text-white">{isSaving ? 'Saving…' : 'Commit changes'}</span>
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
                  <Lock className="size-4" /> Read-only
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
                {LANGUAGE_LOGOS.has(language) ? (
                  <Image src={`/${language}.png`} alt={language} width={24} height={24} />
                ) : (
                  <Blocks className="size-4 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-medium text-white">
                  Collaborative Editor
                  {isDirty && <span className="ml-2 text-xs text-amber-400">● unsaved changes</span>}
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className={`inline-block size-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                  {isConnected ? `${editingCount} ${editingCount === 1 ? 'person' : 'people'} in this file` : 'Connecting…'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[{ clientId: 'self', name: `${currentUser.name} (you)`, avatar: currentUser.avatar, color: colorForUser(currentUser.id) }, ...others]
                  .slice(0, 6)
                  .map((c) => (
                    <div
                      key={c.clientId}
                      title={c.name}
                      className="relative size-8 rounded-full ring-2 overflow-hidden bg-[#1e1e2e] flex items-center justify-center text-xs font-semibold text-white"
                      style={{ boxShadow: `0 0 0 2px ${c.color}` }}
                    >
                      {c.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatar} alt={c.name} className="size-full object-cover" />
                      ) : (
                        c.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  ))}
              </div>
              {canEdit && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsResetDialogOpen(true)}
                  disabled={!isDirty}
                  title="Discard changes since the last commit"
                  className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors disabled:opacity-40"
                >
                  <RotateCcw className="size-4 text-gray-400" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
            <Editor
              height="600px"
              language={language}
              defaultValue={file}
              path={`${projectId}/${filepath}`}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={handleMount}
              options={{
                readOnly: !canEdit,
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: 'selection',
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                contextmenu: true,
                renderLineHighlight: 'all',
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              }}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        onConfirm={handleReset}
        title="Discard changes?"
        description="This reverts the file to its last committed version for everyone editing it."
        confirmText="Discard"
      />
    </div>
  );
}
