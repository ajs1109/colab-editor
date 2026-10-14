import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getFileAtLatestCommit, getRepoAccess, normalizePath, RepoError } from '@/utils/supabase/repo-files';
import EditPage from './_components/EditPage';

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export default async function FileEditPage({
  params,
}: {
  params: Promise<{ username: string; repo: string; filepath: string[] }>;
}) {
  const { username, repo, filepath } = await params;
  const path = normalizePath(filepath.map(decodeSegment).join('/'));
  const supabase = await createClient();

  let access;
  try {
    access = await getRepoAccess(supabase, username, repo);
  } catch (error) {
    if (error instanceof RepoError && error.status === 404) notFound();
    throw error;
  }

  if (!access.userId) {
    redirect(`/login?next=${encodeURIComponent(`/${username}/${repo}/edit/${path}`)}`);
  }
  if (!access.permissions.read) notFound();

  const file = await getFileAtLatestCommit(supabase, access.projectId, path);
  if (!file) notFound();

  const { data: profile } = await supabase
    .from('users')
    .select('id, name, avatar')
    .eq('id', access.userId)
    .maybeSingle();

  return (
    <EditPage
      username={username}
      repo={repo}
      projectId={access.projectId}
      filepath={path}
      file={file.content ?? ''}
      canEdit={access.permissions.write}
      currentUser={{
        id: access.userId,
        name: profile?.name || 'Anonymous',
        avatar: profile?.avatar ?? null,
      }}
    />
  );
}
