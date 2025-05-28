import { tasks } from '@/utils/tasks';
import { TaskDetailsWrapper } from './TaskDetailsWrapper';

interface Props {
  params: Promise<{
    taskId: string;
  }>;
}
const TaskDetailsPage = async ({ params }: Props) => {
  const { taskId } = await params;

  const task = await tasks.details.get(taskId);

  return <TaskDetailsWrapper task={task} />;
};

export default TaskDetailsPage;
