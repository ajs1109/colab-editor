// app/api/repo/[username]/[repo]/commits/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createCommit, getRepoAccess, RepoChange, RepoError } from '@/utils/supabase/repo-files';

const ACTIONS = ['create', 'update', 'delete', 'rename'];

function isRepoChange(value: any): value is RepoChange {
  if (!value || typeof value.path !== 'string' || !ACTIONS.includes(value.action)) return false;
  switch (value.action) {
    case 'create':
      return (value.type === 'file' || value.type === 'dir') &&
        (value.content === undefined || typeof value.content === 'string');
    case 'update':
      return typeof value.content === 'string';
    case 'rename':
      return typeof value.newPath === 'string';
    default:
      return true;
  }
}

// Creates a commit from a list of file changes. The committer is always the
// signed-in user; they need write access to the repository.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string; repo: string }> }
) {
  const { username, repo } = await params;
  const supabase = await createClient();

  let body: { message?: unknown; changes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, changes } = body;
  if (typeof message !== 'string' || !Array.isArray(changes) || !changes.every(isRepoChange)) {
    return NextResponse.json({ error: 'Expected { message: string, changes: RepoChange[] }' }, { status: 400 });
  }

  try {
    const access = await getRepoAccess(supabase, username, repo);
    if (!access.userId) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 });
    }
    if (!access.permissions.write) {
      return NextResponse.json({ error: 'You do not have write access to this repository' }, { status: 403 });
    }

    const commitId = await createCommit(supabase, {
      projectId: access.projectId,
      committerId: access.userId,
      message,
      changes,
    });
    return NextResponse.json({ commitId });
  } catch (error) {
    if (error instanceof RepoError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Failed to create commit', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
