'use client';
import TextEditor from '@/components/TextEditor';
import { Button } from '@/components/ui/button';
import React, { useMemo } from 'react';
import { TaskDescription } from './TaskDescription';
import { getTimelineItems } from '@/lib/get-timeline-items';
import ActivityRenderer from './ActivityRenderer';
import { Comment } from './Comment';
import { successBtnStyles } from '@/app/commonStyles';
import { cn } from '@/lib/utils';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Assignees } from './Assignees';
import { OtherActions } from './OtherActions';
import { Participants } from './Participants';
import { Project } from './Project';
import { TaskLabels } from './TaskLabels';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { useActivityQueries } from '@/hooks/useActivityQueries';
import { useCommentQueries } from '@/hooks/useCommentQueries';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { UserCard } from '@/components/UserCard';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

// Separate component for the comment form to prevent re-renders of the entire timeline
const CommentForm = () => {
  const [comment, setComment] = React.useState('');
  const [resetKey, setResetKey] = React.useState(0);
  const { selectedTask } = useTaskDetails();
  const { createComment } = useCommentQueries(selectedTask?.id || '');
  const { user } = useCurrentUser();

  const handleCreateComment = async () => {
    if (!comment.trim() || !selectedTask?.id || !user?.id) return;

    try {
      await createComment({
        task_id: selectedTask.id,
        user_id: user.id,
        content: comment,
      });

      // Reset the comment input
      setComment('');
      setResetKey((prev) => prev + 1);
    } catch (error) {
      toast({
        title: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="my-6">
      <div className=" pb-4 flex items-center space-x-2">
        <UserCard
          id={user?.id || ''}
          name={user?.name || ''}
          avatarUrl={user?.avatar || ''}
          description={user?.description || ''}
          links={user?.links || []}
          avatarStyles="w-7 h-7"
          showPreviewName={false}
        />
        <span className="font-bold">Add a comment</span>
      </div>
      <TextEditor
        content={comment}
        onChange={setComment}
        isEditable
        resetKey={resetKey}
      />
      <div className="flex justify-end py-2">
        <Button
          className={cn(successBtnStyles)}
          onClick={handleCreateComment}
          disabled={!comment.trim()}
        >
          Add Comment
        </Button>
      </div>
    </div>
  );
};

// Memoized timeline item renderer
const MemoizedTimelineItem = React.memo(
  ({
    item,
    allMembers,
    statuses,
    labels,
  }: {
    item: any;
    allMembers: any[];
    statuses: any[];
    labels: any[];
  }) => {
    if (item.type === 'activity') {
      return (
        <ActivityRenderer
          activity={item.value as ActivityResponse}
          allMembers={allMembers}
          statuses={statuses}
          labels={labels}
        />
      );
    }
    return (
      <div className="bg-white dark:bg-gray-950 my-6 ml-[-2rem]">
        <Comment comment={item.value as CommentResponse} />
      </div>
    );
  }
);

MemoizedTimelineItem.displayName = 'MemoizedTimelineItem';

export const TaskDetails = () => {
  const { selectedTask } = useTaskDetails();
  const { taskActivities } = useActivityQueries(selectedTask?.id as string);
  const params = useParams();
  const projectId = params.projectId as string;
  const { statuses, members, labels } = useProjectQueries(projectId);
  const { user } = useCurrentUser();
  const { taskComments } = useCommentQueries(selectedTask?.id as string);

  const allMembers = useMemo(() => {
    if (!members || !user) return members;
    const isCurrentUserMember = members.some((m) => m.id === user.id);
    return isCurrentUserMember ? members : [...members, user];
  }, [members, user]);

  // Memoize timeline items
  const timelineItems = useMemo(
    () => getTimelineItems(taskActivities || [], taskComments || []),
    [taskActivities, taskComments]
  );

  return (
    <div className="flex flex-col lg:flex-row py-6 gap-6">
      <div className="flex-grow">
        <p className="font-bold pb-2">Description</p>
        <TaskDescription />
        <div className="border-l pt-4 ml-8">
          {timelineItems.map((item) => (
            <MemoizedTimelineItem
              key={item.id}
              item={item}
              allMembers={allMembers || []}
              statuses={statuses || []}
              labels={labels || []}
            />
          ))}
        </div>
        <CommentForm />
      </div>

      <div className="w-full lg:w-[255px]">
        <Assignees />
        <Separator />
        <TaskLabels />
        <Separator />
        <Project />
        <Separator />
        <Participants />
        <Separator />
        <OtherActions />
      </div>
    </div>
  );
};
