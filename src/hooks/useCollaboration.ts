'use client';

// Real-time collaboration for a single file over Supabase Realtime.
//
// - Presence: who is in the file, their colour and cursor/selection.
// - Broadcast "edit": incremental Monaco edits, applied by every other peer.
// - Broadcast "sync-request"/"sync-response": a newcomer asks the longest-present
//   peer for the current (unsaved) buffer so everyone starts from the same text.
// - Broadcast "saved": a peer committed the buffer; others update their baseline.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { editor as MonacoEditor, IDisposable } from 'monaco-editor';
import { supabase } from '@/lib/apiClient';

export interface CollaboratorCursor {
  lineNumber: number;
  column: number;
}

export interface CollaboratorSelection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface Collaborator {
  clientId: string;
  userId: string;
  name: string;
  avatar: string | null;
  color: string;
  joinedAt: number;
  cursor: CollaboratorCursor | null;
  selection: CollaboratorSelection | null;
}

export interface CollaborationUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface EditPayload {
  clientId: string;
  changes: { range: CollaboratorSelection; text: string }[];
}

interface UseCollaborationOptions {
  roomId: string;
  user: CollaborationUser;
  editor: MonacoEditor.IStandaloneCodeEditor | null;
  onRemoteSave?: (info: { content: string; commitId: string; by: string }) => void;
}

export function colorForUser(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  return `hsl(${Math.abs(hash) % 360}, 75%, 60%)`;
}

const CURSOR_THROTTLE_MS = 80;

export function useCollaboration({ roomId, user, editor, onRemoteSave }: UseCollaborationOptions) {
  const clientId = useMemo(
    () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    []
  );
  const joinedAt = useMemo(() => Date.now(), []);
  const color = useMemo(() => colorForUser(user.id), [user.id]);

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const applyingRemoteRef = useRef(false);
  const syncedRef = useRef(false);
  const selfStateRef = useRef<Omit<Collaborator, 'clientId'>>({
    userId: user.id,
    name: user.name,
    avatar: user.avatar,
    color,
    joinedAt,
    cursor: null,
    selection: null,
  });
  const onRemoteSaveRef = useRef(onRemoteSave);
  onRemoteSaveRef.current = onRemoteSave;
  const editorRef = useRef(editor);
  editorRef.current = editor;

  const applyRemote = useCallback((fn: (model: MonacoEditor.ITextModel) => void) => {
    const model = editorRef.current?.getModel();
    if (!model) return;
    applyingRemoteRef.current = true;
    try {
      fn(model);
    } finally {
      applyingRemoteRef.current = false;
    }
  }, []);

  // Channel lifecycle.
  useEffect(() => {
    const channel = supabase.channel(`file:${roomId}`, {
      config: { broadcast: { self: false }, presence: { key: clientId } },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<Omit<Collaborator, 'clientId'>>();
        const list: Collaborator[] = Object.entries(state)
          .map(([key, metas]) => ({ ...metas[metas.length - 1], clientId: key }))
          .sort((a, b) => a.joinedAt - b.joinedAt);
        setCollaborators(list);
      })
      .on('broadcast', { event: 'edit' }, ({ payload }: { payload: EditPayload }) => {
        applyRemote((model) => model.applyEdits(payload.changes.map((c) => ({ range: c.range, text: c.text }))));
      })
      .on('broadcast', { event: 'sync-request' }, ({ payload }) => {
        // Only the longest-present peer answers, so the newcomer gets one reply.
        const state = channel.presenceState<Omit<Collaborator, 'clientId'>>();
        const others = Object.entries(state)
          .filter(([key]) => key !== payload.clientId)
          .map(([key, metas]) => ({ key, joinedAt: metas[metas.length - 1].joinedAt }))
          .sort((a, b) => a.joinedAt - b.joinedAt);
        const model = editorRef.current?.getModel();
        if (others[0]?.key === clientId && model) {
          channel.send({
            type: 'broadcast',
            event: 'sync-response',
            payload: { to: payload.clientId, content: model.getValue() },
          });
        }
      })
      .on('broadcast', { event: 'sync-response' }, ({ payload }) => {
        if (payload.to !== clientId || syncedRef.current) return;
        syncedRef.current = true;
        applyRemote((model) => {
          if (model.getValue() !== payload.content) model.setValue(payload.content);
        });
      })
      .on('broadcast', { event: 'saved' }, ({ payload }) => {
        onRemoteSaveRef.current?.(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track(selfStateRef.current);
          channel.send({ type: 'broadcast', event: 'sync-request', payload: { clientId } });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    return () => {
      channelRef.current = null;
      setIsConnected(false);
      supabase.removeChannel(channel);
    };
  }, [roomId, clientId, applyRemote]);

  // Publish local edits and cursor movements.
  useEffect(() => {
    if (!editor) return;
    const disposables: IDisposable[] = [];
    let cursorTimer: ReturnType<typeof setTimeout> | null = null;

    disposables.push(
      editor.onDidChangeModelContent((event) => {
        if (applyingRemoteRef.current || event.isFlush) return;
        channelRef.current?.send({
          type: 'broadcast',
          event: 'edit',
          payload: {
            clientId,
            changes: event.changes.map((change) => ({ range: change.range, text: change.text })),
          } satisfies EditPayload,
        });
      })
    );

    disposables.push(
      editor.onDidChangeCursorSelection((event) => {
        const { selection } = event;
        selfStateRef.current = {
          ...selfStateRef.current,
          cursor: { lineNumber: selection.positionLineNumber, column: selection.positionColumn },
          selection: selection.isEmpty()
            ? null
            : {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn,
              },
        };
        if (cursorTimer) return;
        cursorTimer = setTimeout(() => {
          cursorTimer = null;
          channelRef.current?.track(selfStateRef.current);
        }, CURSOR_THROTTLE_MS);
      })
    );

    return () => {
      if (cursorTimer) clearTimeout(cursorTimer);
      disposables.forEach((d) => d.dispose());
    };
  }, [editor, clientId]);

  // Render other people's cursors and selections.
  useEffect(() => {
    if (!editor) return;
    const others = collaborators.filter((c) => c.clientId !== clientId);

    const styleId = `collab-styles-${clientId}`;
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = others
      .map((c, i) => {
        const label = JSON.stringify(c.name);
        return `
          .collab-cursor-${i} { border-left: 2px solid ${c.color}; margin-left: -1px; }
          .collab-cursor-${i}::after {
            content: ${label}; position: absolute; transform: translateY(-100%);
            background: ${c.color}; color: #0a0a0f; font-size: 10px; font-weight: 600;
            padding: 0 4px; border-radius: 3px 3px 3px 0; white-space: nowrap; pointer-events: none;
          }
          .collab-selection-${i} { background-color: ${c.color}; opacity: 0.25; }
        `;
      })
      .join('\n');

    const decorations: MonacoEditor.IModelDeltaDecoration[] = [];
    others.forEach((c, i) => {
      if (c.selection) {
        decorations.push({
          range: c.selection,
          options: { className: `collab-selection-${i}`, hoverMessage: { value: c.name } },
        });
      }
      if (c.cursor) {
        decorations.push({
          range: {
            startLineNumber: c.cursor.lineNumber,
            startColumn: c.cursor.column,
            endLineNumber: c.cursor.lineNumber,
            endColumn: c.cursor.column,
          },
          options: {
            beforeContentClassName: `collab-cursor-${i}`,
            hoverMessage: { value: `**${c.name}** is editing` },
            stickiness: 1, // NeverGrowsWhenTypingAtEdges
          },
        });
      }
    });

    const collection = editor.createDecorationsCollection(decorations);
    return () => collection.clear();
  }, [editor, collaborators, clientId]);

  useEffect(() => {
    return () => document.getElementById(`collab-styles-${clientId}`)?.remove();
  }, [clientId]);

  const announceSave = useCallback(
    (content: string, commitId: string) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'saved',
        payload: { content, commitId, by: user.name },
      });
    },
    [user.name]
  );

  return { clientId, collaborators, isConnected, announceSave };
}
