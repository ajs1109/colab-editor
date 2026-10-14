// Server-only helpers for the versioned file tree.
//
// Every commit stores a file_tree row only for the paths it touched. The state of
// a project at a commit is the newest row for each path at or before that commit;
// rows with is_deleted = true are tombstones. See supabase/migrations/0001_versioned_files.sql.
//
// Deliberately NOT a "use server" module: these functions must not be callable as
// server actions from the browser. Call them from route handlers and server components.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { File as RepoFile } from '@/types/project';

export type RepoPermissions = { read: boolean; write: boolean; admin: boolean };

export interface RepoAccess {
  projectId: string;
  ownerId: string;
  userId: string | null;
  permissions: RepoPermissions;
}

export type RepoChange =
  | { action: 'create'; path: string; type: 'file' | 'dir'; content?: string }
  | { action: 'update'; path: string; content: string }
  | { action: 'delete'; path: string }
  | { action: 'rename'; path: string; newPath: string };

export class RepoError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const PAGE_SIZE = 1000;

export function normalizePath(path: string): string {
  return path
    .split('/')
    .map((part) => part.trim())
    .filter((part) => part && part !== '.')
    .join('/');
}

function isValidPath(path: string): boolean {
  return path.length > 0 && !path.split('/').some((part) => part === '..');
}

function baseName(path: string) {
  return path.split('/').pop() || path;
}

function parentPath(path: string) {
  return path.split('/').slice(0, -1).join('/');
}

function extensionOf(name: string) {
  return name.includes('.') ? name.split('.').pop() || null : null;
}

// Count changed lines as a multiset difference. Cheaper than a full diff and
// accurate enough for the +/- summary shown in the commit history.
export function countLineChanges(oldContent: string, newContent: string) {
  const oldLines = oldContent ? oldContent.split('\n') : [];
  const newLines = newContent ? newContent.split('\n') : [];
  const remaining = new Map<string, number>();
  for (const line of oldLines) remaining.set(line, (remaining.get(line) || 0) + 1);

  let additions = 0;
  for (const line of newLines) {
    const count = remaining.get(line) || 0;
    if (count > 0) remaining.set(line, count - 1);
    else additions++;
  }
  let deletions = 0;
  remaining.forEach((count) => (deletions += count));
  return { additions, deletions };
}

export async function getRepoAccess(
  supabase: SupabaseClient,
  username: string,
  repo: string
): Promise<RepoAccess> {
  const { data: owner } = await supabase
    .from('users')
    .select('id')
    .eq('name', username)
    .maybeSingle();
  if (!owner) throw new RepoError('User not found', 404);

  const { data: project } = await supabase
    .from('projects')
    .select('id, created_by, is_public')
    .eq('created_by', owner.id)
    .eq('name', repo)
    .maybeSingle();
  if (!project) throw new RepoError('Repository not found', 404);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let permissions: RepoPermissions = { read: !!project.is_public, write: false, admin: false };

  if (user) {
    if (project.created_by === user.id) {
      permissions = { read: true, write: true, admin: true };
    } else {
      const { data: membership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .eq('invitationStatus', 'accepted')
        .maybeSingle();
      if (membership) {
        permissions = {
          read: true,
          write: ['write', 'admin'].includes(membership.role),
          admin: membership.role === 'admin',
        };
      }
    }
  }

  return { projectId: project.id, ownerId: project.created_by, userId: user?.id ?? null, permissions };
}

async function getCommitTimes(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('commits')
    .select('id, committed_at')
    .eq('project_id', projectId)
    .order('committed_at', { ascending: true });
  if (error) throw new RepoError(error.message, 500);

  const times = new Map<string, number>();
  for (const commit of data || []) times.set(commit.id, new Date(commit.committed_at).getTime());
  return { times, latestId: data?.length ? data[data.length - 1].id : null };
}

/**
 * Returns the files and folders of a project as of `commitId` (default: latest commit).
 */
export async function getFilesAtCommit(
  supabase: SupabaseClient,
  projectId: string,
  commitId?: string
): Promise<RepoFile[]> {
  const { times } = await getCommitTimes(supabase, projectId);
  const cutoff = commitId ? times.get(commitId) : Infinity;
  if (cutoff === undefined) throw new RepoError('Commit not found', 404);

  type Row = { id: string; path: string; commit_id: string; is_deleted: boolean; created_at: string };
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('file_tree')
      .select('id, path, commit_id, is_deleted, created_at')
      .eq('project_id', projectId)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new RepoError(error.message, 500);
    rows.push(...((data as Row[]) || []));
    if (!data || data.length < PAGE_SIZE) break;
  }

  const latest = new Map<string, { row: Row; time: number }>();
  for (const row of rows) {
    const time = times.get(row.commit_id);
    if (time === undefined || time > cutoff) continue;
    const path = normalizePath(row.path);
    const current = latest.get(path);
    if (
      !current ||
      time > current.time ||
      (time === current.time && row.created_at > current.row.created_at)
    ) {
      latest.set(path, { row, time });
    }
  }

  const liveIds = Array.from(latest.values())
    .filter(({ row }) => !row.is_deleted)
    .map(({ row }) => row.id);

  const files: RepoFile[] = [];
  for (let i = 0; i < liveIds.length; i += 100) {
    const { data, error } = await supabase
      .from('file_tree')
      .select('id, path, name, type, content, size, extension')
      .in('id', liveIds.slice(i, i + 100));
    if (error) throw new RepoError(error.message, 500);
    for (const file of data || []) {
      files.push({
        ...file,
        path: normalizePath(file.path),
        content: file.content ?? undefined,
        is_directory: file.type === 'dir',
      });
    }
  }

  return files.sort((a, b) =>
    a.type === b.type ? a.path.localeCompare(b.path) : a.type === 'dir' ? -1 : 1
  );
}

export async function getFileAtLatestCommit(
  supabase: SupabaseClient,
  projectId: string,
  path: string
): Promise<RepoFile | null> {
  const target = normalizePath(path);
  const files = await getFilesAtCommit(supabase, projectId);
  return files.find((file) => file.path === target && file.type === 'file') ?? null;
}

type TreeRow = {
  project_id: string;
  commit_id: string;
  path: string;
  name: string;
  type: 'file' | 'dir';
  content: string | null;
  size: number;
  extension: string | null;
  mime_type: string | null;
  is_deleted: boolean;
};

type ChangeRow = {
  path: string;
  change_type: 'added' | 'modified' | 'deleted' | 'renamed';
  old_path: string | null;
  new_path: string | null;
  old_content: string | null;
  new_content: string | null;
  additions: number;
  deletions: number;
};

/**
 * Applies `changes` on top of the latest commit and records them as a new commit.
 * Returns the new commit id.
 */
export async function createCommit(
  supabase: SupabaseClient,
  {
    projectId,
    committerId,
    message,
    changes,
  }: { projectId: string; committerId: string; message: string; changes: RepoChange[] }
): Promise<string> {
  if (!changes.length) throw new RepoError('No changes to commit', 400);

  const { latestId } = await getCommitTimes(supabase, projectId);
  const current = new Map((await getFilesAtCommit(supabase, projectId)).map((f) => [f.path, f]));

  const treeRows = new Map<string, Omit<TreeRow, 'project_id' | 'commit_id'>>();
  const changeRows: ChangeRow[] = [];

  const exists = (path: string) => {
    const pending = treeRows.get(path);
    return pending ? !pending.is_deleted : current.has(path);
  };
  const descendants = (path: string) =>
    Array.from(current.values()).filter((f) => f.path.startsWith(`${path}/`) && exists(f.path));

  const put = (path: string, type: 'file' | 'dir', content: string | null) => {
    const name = baseName(path);
    treeRows.set(path, {
      path,
      name,
      type,
      content: type === 'file' ? content ?? '' : null,
      size: type === 'file' ? (content ?? '').length : 0,
      extension: type === 'file' ? extensionOf(name) : null,
      mime_type: type === 'file' ? 'text/plain' : null,
      is_deleted: false,
    });
  };
  const remove = (path: string, type: 'file' | 'dir') => {
    treeRows.set(path, {
      path,
      name: baseName(path),
      type,
      content: null,
      size: 0,
      extension: null,
      mime_type: null,
      is_deleted: true,
    });
  };
  const ensureParents = (path: string) => {
    for (let dir = parentPath(path); dir; dir = parentPath(dir)) {
      if (exists(dir)) break;
      put(dir, 'dir', null);
    }
  };
  const contentOf = (path: string) => {
    const pending = treeRows.get(path);
    return (pending ? pending.content : current.get(path)?.content) ?? '';
  };
  const typeOf = (path: string): 'file' | 'dir' =>
    treeRows.get(path)?.type ?? current.get(path)?.type ?? 'file';

  for (const change of changes) {
    const path = normalizePath(change.path);
    if (!isValidPath(path)) throw new RepoError(`Invalid path "${change.path}"`, 400);

    switch (change.action) {
      case 'create': {
        if (exists(path)) throw new RepoError(`"${path}" already exists`, 409);
        ensureParents(path);
        const content = change.type === 'file' ? change.content ?? '' : null;
        put(path, change.type, content);
        if (change.type === 'file') {
          changeRows.push({
            path,
            change_type: 'added',
            old_path: null,
            new_path: path,
            old_content: null,
            new_content: content,
            ...countLineChanges('', content ?? ''),
          });
        }
        break;
      }
      case 'update': {
        if (!exists(path) || typeOf(path) !== 'file') throw new RepoError(`File "${path}" not found`, 404);
        const oldContent = contentOf(path);
        if (oldContent === change.content) break;
        put(path, 'file', change.content);
        changeRows.push({
          path,
          change_type: 'modified',
          old_path: path,
          new_path: path,
          old_content: oldContent,
          new_content: change.content,
          ...countLineChanges(oldContent, change.content),
        });
        break;
      }
      case 'delete': {
        if (!exists(path)) throw new RepoError(`"${path}" not found`, 404);
        const targets = [
          { path, type: typeOf(path) },
          ...descendants(path).map((f) => ({ path: f.path, type: f.type })),
        ];
        for (const target of targets) {
          const oldContent = target.type === 'file' ? contentOf(target.path) : null;
          remove(target.path, target.type);
          if (target.type === 'file') {
            changeRows.push({
              path: target.path,
              change_type: 'deleted',
              old_path: target.path,
              new_path: null,
              old_content: oldContent,
              new_content: null,
              ...countLineChanges(oldContent ?? '', ''),
            });
          }
        }
        break;
      }
      case 'rename': {
        const newPath = normalizePath(change.newPath);
        if (!isValidPath(newPath)) throw new RepoError(`Invalid path "${change.newPath}"`, 400);
        if (!exists(path)) throw new RepoError(`"${path}" not found`, 404);
        if (newPath === path) break;
        if (exists(newPath)) throw new RepoError(`"${newPath}" already exists`, 409);
        if (newPath.startsWith(`${path}/`)) throw new RepoError('Cannot move a folder into itself', 400);

        ensureParents(newPath);
        const targets = [
          { path, type: typeOf(path) },
          ...descendants(path).map((f) => ({ path: f.path, type: f.type })),
        ];
        for (const target of targets) {
          const movedPath = newPath + target.path.slice(path.length);
          const content = target.type === 'file' ? contentOf(target.path) : null;
          remove(target.path, target.type);
          put(movedPath, target.type, content);
          if (target.type === 'file') {
            changeRows.push({
              path: movedPath,
              change_type: 'renamed',
              old_path: target.path,
              new_path: movedPath,
              old_content: content,
              new_content: content,
              additions: 0,
              deletions: 0,
            });
          }
        }
        break;
      }
    }
  }

  if (!treeRows.size) throw new RepoError('No changes to commit', 400);

  const { data: commit, error: commitError } = await supabase
    .from('commits')
    .insert({
      project_id: projectId,
      message: message.trim() || 'Update files',
      committer_id: committerId,
      parent_commit_id: latestId,
      committed_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (commitError || !commit) throw new RepoError(commitError?.message || 'Failed to create commit', 500);

  const { data: inserted, error: treeError } = await supabase
    .from('file_tree')
    .insert(
      Array.from(treeRows.values()).map((row) => ({ ...row, project_id: projectId, commit_id: commit.id }))
    )
    .select('id, path');

  if (treeError) {
    // Best-effort rollback so a half-written commit doesn't show up in history.
    await supabase.from('commits').delete().eq('id', commit.id);
    throw new RepoError(treeError.message, 500);
  }

  if (changeRows.length) {
    const idByPath = new Map((inserted || []).map((row) => [row.path, row.id]));
    const { error: changesError } = await supabase.from('file_changes').insert(
      changeRows.map(({ path, ...row }) => ({
        ...row,
        commit_id: commit.id,
        file_id: idByPath.get(path) ?? null,
      }))
    );
    if (changesError) throw new RepoError(changesError.message, 500);
  }

  return commit.id;
}
