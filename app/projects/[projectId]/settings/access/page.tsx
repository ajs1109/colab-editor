import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsLayout } from '../SettingsLayout';
import { AccessContainer } from './AccessContainer';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function AccessPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Load project details and members
  const [{ data: project }, { data: members }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', projectId).single(),
    supabase
      .from('project_members')
      .select(`*, user:users (id, name, email, avatar)`)
      .eq('project_id', projectId),
  ]);

  if (!project) redirect('/projects');

  // Get current user's role - creators are always admin
  const isCreator = project.created_by === user.id;
  const currentMember = members?.find((m) => m.user_id === user.id);
  const currentUserRole = isCreator ? 'admin' : currentMember?.role || 'read';

  return (
    <SettingsLayout title="Who has access">
      <AccessContainer
        projectId={projectId}
        projectName={project.name}
        initialMembers={members || []}
        currentUserId={user.id}
        currentUserRole={currentUserRole}
        createdBy={project.created_by}
      />
    </SettingsLayout>
  );
}
