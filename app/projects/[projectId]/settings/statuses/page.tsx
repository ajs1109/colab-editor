import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsLayout } from '../SettingsLayout';
import { Statuses } from './Statuses';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function StatusesPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  // Load project statuses
  const { data: statuses, error } = await supabase
    .from('statuses')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error loading statuses:', error);
    redirect('/projects');
  }

  return (
    <SettingsLayout title="Status Settings">
      <Statuses projectId={projectId} items={statuses || []} />
    </SettingsLayout>
  );
}
