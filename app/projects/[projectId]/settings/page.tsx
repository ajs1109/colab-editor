import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectSettingsForm } from './ProjectSettingsForm';
import { SettingsLayout } from './SettingsLayout';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !project) redirect('/projects');

  return (
    <SettingsLayout title="Project Settings">
      <ProjectSettingsForm project={project} />
    </SettingsLayout>
  );
}
