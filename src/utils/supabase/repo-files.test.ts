import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeSupabase } from '@/test/fake-supabase';
import { countLineChanges, createCommit, getFilesAtCommit, RepoError, type RepoChange } from './repo-files';

const PROJECT = 'proj';

// A fresh project with one empty initial commit. Every commit() advances the
// fake clock so commits get strictly increasing committed_at values.
function setupRepo() {
  const { client, db } = createFakeSupabase({ unique: { file_tree: ['path', 'commit_id'] } });
  let now = Date.UTC(2024, 0, 1);
  db.commits = [{ id: 'c0', project_id: PROJECT, committed_at: new Date(now).toISOString() }];
  db.file_tree = [];
  db.file_changes = [];

  const commit = (changes: RepoChange[]) => {
    vi.setSystemTime((now += 1000));
    return createCommit(client, { projectId: PROJECT, committerId: 'u1', message: 'm', changes });
  };
  const files = (commitId?: string) => getFilesAtCommit(client, PROJECT, commitId);
  const paths = async (commitId?: string) => (await files(commitId)).map((f) => `${f.type}:${f.path}`);
  const contentOf = async (path: string, commitId?: string) =>
    (await files(commitId)).find((f) => f.path === path)?.content;

  return { db, commit, files, paths, contentOf };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('createCommit / getFilesAtCommit', () => {
  it('normalises paths and auto-creates parent folders', async () => {
    const repo = setupRepo();
    await repo.commit([{ action: 'create', path: '/src/app.ts', type: 'file', content: 'a\nb' }]);
    expect(await repo.paths()).toEqual(['dir:src', 'file:src/app.ts']);
  });

  it('rejects creating a path that already exists', async () => {
    const repo = setupRepo();
    await repo.commit([{ action: 'create', path: '/src/app.ts', type: 'file', content: 'a\nb' }]);
    await expect(repo.commit([{ action: 'create', path: 'src/app.ts', type: 'file' }])).rejects.toBeInstanceOf(
      RepoError
    );
  });

  it('records updates with old content and line counts, leaving older commits untouched', async () => {
    const repo = setupRepo();
    const c1 = await repo.commit([{ action: 'create', path: 'src/app.ts', type: 'file', content: 'a\nb' }]);
    const c2 = await repo.commit([{ action: 'update', path: 'src/app.ts', content: 'a\nc\nd' }]);

    expect(await repo.contentOf('src/app.ts')).toBe('a\nc\nd');
    const change = repo.db.file_changes.find((c) => c.commit_id === c2);
    expect(change).toMatchObject({ change_type: 'modified', old_content: 'a\nb', additions: 2, deletions: 1 });

    // History isolation: the older commit still sees the old content.
    expect(await repo.contentOf('src/app.ts', c1)).toBe('a\nb');
  });

  it('renaming a folder moves its children', async () => {
    const repo = setupRepo();
    await repo.commit([{ action: 'create', path: 'src/app.ts', type: 'file', content: 'a\nc\nd' }]);
    await repo.commit([{ action: 'create', path: 'src/lib/util.ts', type: 'file', content: 'x' }]);
    const c = await repo.commit([{ action: 'rename', path: 'src', newPath: 'app' }]);

    expect(await repo.paths()).toEqual(['dir:app', 'dir:app/lib', 'file:app/app.ts', 'file:app/lib/util.ts']);
    expect(await repo.contentOf('app/app.ts')).toBe('a\nc\nd');
    expect(repo.db.file_changes.filter((ch) => ch.commit_id === c && ch.change_type === 'renamed')).toHaveLength(2);
  });

  it('deleting a folder removes its children, and a deleted path can be re-created', async () => {
    const repo = setupRepo();
    const c1 = await repo.commit([
      { action: 'create', path: 'app/app.ts', type: 'file', content: 'a' },
      { action: 'create', path: 'app/lib/util.ts', type: 'file', content: 'x' },
    ]);

    await repo.commit([{ action: 'delete', path: 'app/lib' }]);
    expect(await repo.paths()).toEqual(['dir:app', 'file:app/app.ts']);

    await repo.commit([{ action: 'create', path: 'app/lib', type: 'dir' }]);
    expect(await repo.paths()).toEqual(['dir:app', 'dir:app/lib', 'file:app/app.ts']);

    // Old commits are unaffected.
    expect(await repo.paths(c1)).toEqual(['dir:app', 'dir:app/lib', 'file:app/app.ts', 'file:app/lib/util.ts']);
  });

  it('rejects an update that does not change anything', async () => {
    const repo = setupRepo();
    await repo.commit([{ action: 'create', path: 'app/app.ts', type: 'file', content: 'a\nc\nd' }]);
    await expect(repo.commit([{ action: 'update', path: 'app/app.ts', content: 'a\nc\nd' }])).rejects.toThrow(
      /No changes/
    );
  });

  it('rejects invalid paths', async () => {
    const repo = setupRepo();
    await expect(repo.commit([{ action: 'create', path: '../x', type: 'file' }])).rejects.toThrow(/Invalid path/);
  });

  it('rejects moving a folder into itself', async () => {
    const repo = setupRepo();
    await repo.commit([{ action: 'create', path: 'app/app.ts', type: 'file', content: 'a' }]);
    await expect(repo.commit([{ action: 'rename', path: 'app', newPath: 'app/inner' }])).rejects.toThrow(
      /into itself/
    );
  });
});

describe('countLineChanges', () => {
  it('counts additions from empty content', () => {
    expect(countLineChanges('', 'a\nb')).toEqual({ additions: 2, deletions: 0 });
  });

  it('counts changed lines as a multiset difference', () => {
    expect(countLineChanges('a\nb', 'a\nc\nd')).toEqual({ additions: 2, deletions: 1 });
  });
});
