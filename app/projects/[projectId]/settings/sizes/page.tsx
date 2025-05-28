import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsLayout } from '../SettingsLayout';
import { Sizes } from './Sizes';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function SizesPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  // Load project sizes
  const { data: sizes, error } = await supabase
    .from('sizes')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error loading sizes:', error);
    redirect('/projects');
  }

  return (
    <SettingsLayout title="Sizes settings">
      <Sizes projectId={projectId} items={sizes || []} />
    </SettingsLayout>
  );
}
