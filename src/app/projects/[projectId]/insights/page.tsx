import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Insights } from './Insights';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function InsightsPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  const [
    { data: tasks },
    { data: statuses },
    { data: labels },
    { data: sizes },
    { data: priorities },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, task_labels ( labels ( id, label, color ) )')
      .eq('project_id', projectId),
    supabase.from('statuses').select('*').eq('project_id', projectId),
    supabase.from('labels').select('*').eq('project_id', projectId),
    supabase.from('sizes').select('*').eq('project_id', projectId),
    supabase.from('priorities').select('*').eq('project_id', projectId),
  ]);

  if (!tasks || !statuses || !labels || !sizes || !priorities) {
    redirect('/projects');
  }

  return (
    <Insights
      initialData={{
        tasks: tasks.map((task) => ({
          ...task,
          labels: task.task_labels?.map((tl: any) => tl.labels.id) || [],
          task_labels: null,
        })),
        statuses,
        labels,
        sizes,
        priorities,
      }}
    />
  );
}
