import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsLayout } from '../SettingsLayout';
import { Priorities } from './Priorities';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function PrioritiesPage({ params }: Props) {
  const { projectId } = await params;

  const supabase = await createClient();

  // Load project priorities
  const { data: priorities, error } = await supabase
    .from('priorities')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error loading priorities:', error);
    redirect('/projects');
  }

  return (
    <SettingsLayout title="Priorities settings">
      <Priorities projectId={projectId} items={priorities || []} />
    </SettingsLayout>
  );
}
