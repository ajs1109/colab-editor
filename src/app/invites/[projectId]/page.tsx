import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ role: Role }>;
}

export default async function InvitePage({ params, searchParams }: Props) {
  const supabase = await createClient();
  const { projectId } = await params;
  const { role } = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/invites/${projectId}?role=${role}`);
  }

  // Check if user has been invited
  const { data: projectMember, error: memberCheckError } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .eq('invitationStatus', 'invited')
    .single();

  if (memberCheckError || !projectMember) {
    notFound();
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('project_members')
    .update({
      invitationStatus: 'accepted',
      joined_at: new Date().toISOString(),
    })
    .eq('project_id', projectId)
    .eq('user_id', user.id);

  if (updateError) {
    throw updateError;
  }
  redirect(`/projects/${projectId}`);
}
