'use client';
import { secondaryBtnStyles, successBtnStyles } from '@/app/commonStyles';
import TextEditor from '@/components/TextEditor';
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/UserCard';
import { useTaskQueries } from '@/hooks/useTaskQueries';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/utils/date';
import { Pen } from 'lucide-react';
import { useState } from 'react';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useParams } from 'next/navigation';

export const TaskDescription = () => {
  const params = useParams();
  const { selectedTask } = useTaskDetails();
  const { task, updateDescription } = useTaskQueries(selectedTask?.id || '');
  const { members } = useProjectQueries(params.projectId as string);
  const [description, setDescription] = useState(task?.description || '');
  const [editable, setEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedTask?.id) return;
    try {
      setIsSaving(true);
      await updateDescription(description);
      setEditable(false);
    } catch (error) {
      console.error('Failed to save description:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDescription(task?.description || '');
    setEditable(false);
  };

  return (
    <div className="border border-sky-200 dark:border-blue-900 rounded">
      <div className="flex items-center justify-end bg-sky-100 dark:bg-slate-900 rounded-t border-b border-sky-200 dark:border-blue-900 overflow-x-auto px-4 py-2">
        <div className="flex justify-between items-center gap-2 text-sm">
          <UserCard
            id={selectedTask?.creator?.id!}
            name={selectedTask?.creator?.name || ''}
            avatarUrl={selectedTask?.creator?.avatar || ''}
            description={task?.creator?.description}
            links={task?.creator?.links}
          />
          <span className="text-gray-500 text-xs">
            opened {formatRelativeTime(task?.created_at!)}
          </span>
        </div>
        <Button
          variant="ghost"
          className="h-7 py-1 px-2 mx-2 text-xs"
          onClick={() => setEditable(true)}
        >
          <Pen className="h-3 w-3 mr-2" />
          Edit
        </Button>
      </div>

      <div className="p-2 min-h-[120px]">
        {editable ? (
          <div>
            <div className="min-h-[180px]">
              <TextEditor
                content={description}
                onChange={setDescription}
                isEditable={editable}
                users={members || []}
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                className={cn(secondaryBtnStyles, 'h-8')}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                className={cn(successBtnStyles, 'h-8')}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <TextEditor
            content={
              description ||
              '<p><em><sub>No Description Provided</sub></em></p>'
            }
            onChange={setDescription}
            isEditable={false}
          />
        )}
      </div>
    </div>
  );
};
