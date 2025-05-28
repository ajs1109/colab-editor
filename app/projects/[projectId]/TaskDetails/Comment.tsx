import { secondaryBtnStyles, successBtnStyles } from '@/app/commonStyles';
import { UserAvatar } from '@/components/Avatar';
import TextEditor from '@/components/TextEditor';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCard } from '@/components/UserCard';
import { useActivityQueries } from '@/hooks/useActivityQueries';
import { useCommentQueries } from '@/hooks/useCommentQueries';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';
import { Ellipsis, Pen, Trash } from 'lucide-react';
import { FC, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { toast } from '@/components/ui/use-toast';

interface Props {
  comment: CommentResponse;
}

export const Comment: FC<Props> = ({ comment }) => {
  const [description, setDescription] = useState(comment.content);
  const [editable, setEditable] = useState(false);
  const { user } = useCurrentUser();
  const { selectedTask } = useTaskDetails();
  const { updateComment, deleteComment } = useCommentQueries(
    selectedTask?.id || ''
  );
  const { createActivity } = useActivityQueries(selectedTask?.id || '');

  const isCommentOwner = user?.id === comment.user.id;

  const handleUpdateComment = async () => {
    if (!description.trim()) return;

    try {
      await updateComment({
        commentId: comment.id,
        content: description,
      });

      setEditable(false);
    } catch (error) {
      toast({
        title: 'Failed to update comment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async () => {
    try {
      await deleteComment(comment.id);

      // Create activity for comment deletion
      await createActivity({
        task_id: selectedTask?.id as string,
        user_id: user?.id as string,
        content: [
          {
            type: 'user',
            id: user?.id as string,
          },
          'deleted a comment on',
          { type: 'date', value: new Date().toISOString() },
        ],
      });
    } catch (error) {
      toast({
        title: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setDescription(comment.content); // Reset to original content
    setEditable(false);
  };

  return (
    <div className="border border-sky-200 dark:border-blue-900 rounded">
      <div className="flex items-center justify-between bg-sky-100 dark:bg-slate-900 rounded-t border-b border-sky-200 dark:border-blue-900 overflow-x-auto px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <span>
            <UserCard
              id={comment.user.id || ''}
              name={comment.user.name || ''}
              avatarUrl={comment.user.avatar || ''}
              description={comment.user.description || ''}
              links={comment.user.links || []}
            />
          </span>{' '}
          <span className="text-gray-500">
            {new Date(comment.created_at).toDateString()}
          </span>
        </div>

        {isCommentOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="w-6 h-6 text-gray-600" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4">
              <DropdownMenuItem onClick={() => setEditable(true)}>
                <Pen className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-500 bg-transparent hover:bg-red-200 hover:dark:bg-red-950"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this comment? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteComment}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="p-2 min-h-[120px]">
        {editable ? (
          <div>
            <div className="min-h-[180px]">
              <TextEditor
                content={description}
                onChange={setDescription}
                isEditable={editable}
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                className={cn(secondaryBtnStyles, 'h-8')}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className={cn(successBtnStyles, 'h-8')}
                onClick={handleUpdateComment}
                disabled={
                  !description.trim() || description === comment.content
                }
              >
                Update Comment
              </Button>
            </div>
          </div>
        ) : (
          <TextEditor
            content={description}
            onChange={setDescription}
            isEditable={false}
          />
        )}
      </div>
    </div>
  );
};
