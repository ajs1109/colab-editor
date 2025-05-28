'use client';
import { Separator } from '@/components/ui/separator';
import { UserCard } from '@/components/UserCard';
import { useEffect } from 'react';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { TaskDetails } from '../TaskDetails';
import { HeaderSection } from '../TaskDetails/HeaderSection';

export const SingleTaskDetails = ({ task }: { task: ITaskWithOptions }) => {
  const { setSelectedTask } = useTaskDetails();

  useEffect(() => {
    setSelectedTask(task);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  return (
    <div className="container py-4">
      <div className="flex">
        <HeaderSection
          title={task?.title || ''}
          taskId={task?.id || ''}
          hideCopyLink
        />
      </div>
      <div className="flex items-center gap-1 text-left text-sm text-gray-500 dark:text-gray-400 w-fit my-2">
        <UserCard
          id={task?.creator?.id || ''}
          name={task?.creator?.name || ''}
          avatarUrl={task?.creator?.avatar || ''}
          description={task?.creator?.description || ''}
          links={task?.creator?.links || []}
          avatarStyles="w-6 h-6"
        />
        <span>
          created this task on {new Date(task?.created_at || '').toDateString()}
        </span>
      </div>
      <Separator className="my-3" />
      <TaskDetails />
    </div>
  );
};
