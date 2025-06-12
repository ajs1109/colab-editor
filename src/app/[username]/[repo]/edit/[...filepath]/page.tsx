import { getFile } from '@/utils/supabase/functions/projects';
import EditPage from './_components/EditPage';

export default async function FileEditPage({params}:{params: {username: string, repo: string, filepath: string[]}}){
  const { username, repo, filepath } = await params;
  const path = filepath.join('/');
  const fileData = await getFile({username, repo, path});

  if(!fileData.success) return null;

  return <EditPage username={username} repo={repo} filepath={path} file={fileData.data} />
}