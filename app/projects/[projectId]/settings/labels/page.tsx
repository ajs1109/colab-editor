import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsLayout } from '../SettingsLayout';
import { LabelsContainer } from './LabelsContainer';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function LabelsPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: labels, error } = await supabase
    .from('labels')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading labels:', error);
    redirect('/projects');
  }

  return (
    <SettingsLayout title="Labels settings">
      <LabelsContainer projectId={projectId} initialLabels={labels || []} />
    </SettingsLayout>
  );
}
