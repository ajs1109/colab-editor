'use client';
import { successBtnStyles } from '@/app/commonStyles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ProjectAction } from '@/consts';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { tasks as taskUtils } from '@/utils/tasks';
import { UniqueIdentifier } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { User } from '@supabase/supabase-js';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ColumnLabelColor } from './ColumnLabelColor';
import { ColumnMenuOptions } from './ColumnMenuOptions';
import { TaskItem } from './TaskItem';
import { useDroppable } from '@dnd-kit/core';
import { getLowestColumnPosition } from '@/utils/sort';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  projectId: string;
  column: IStatus;
  tasks: ITaskWithOptions[];
  projectName: string;
  isOver: boolean;
  can?: (action: ProjectAction) => boolean;
  onTaskCreated?: (task: ITaskWithOptions) => void;
  onColumnUpdate?: (column: IStatus) => void;
  onColumnDelete?: (columnId: string) => void;
  onColumnHide?: (columnId: string) => void;
}

const supabase = createClient();

export const ColumnContainer = ({
  projectId,
  column,
  tasks: columnTasks,
  projectName,
  isOver,
  can,
  onTaskCreated,
  onColumnUpdate,
  onColumnDelete,
  onColumnHide,
}: Props) => {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, []);

  const handleAddItem = async () => {
    if (!inputValue.trim() || isCreating || !user) return;

    try {
      setIsCreating(true);

      // Get lowest position as the new position and place it at the bottom
      const newPosition = getLowestColumnPosition(columnTasks);

      const task = await taskUtils.create({
        project_id: projectId,
        status_id: column.id,
        title: inputValue.trim(),
        description: '',
        created_by: user.id,
        statusPosition: newPosition,
      });

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });

      onTaskCreated?.({ ...task, assignees: [] });
      setInputValue('');
      setShowInput(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create task',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setInputValue('');
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="w-[350px] overflow-x-hidden h-full flex-shrink-0 bg-gray-100 dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800 flex flex-col"
    >
      <div className="p-2 space-y-1 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ColumnLabelColor color={column.color} />
            <h1 className="text-sm font-bold">{column.label}</h1>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`px-2 h-4 rounded-full flex justify-center items-center text-[10px] ${
                      column.limit > 0 && columnTasks.length >= column.limit
                        ? 'bg-red-200 dark:bg-red-950 text-red-700 dark:text-red-400'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {columnTasks.length}{' '}
                    {column.limit ? `/ ${column.limit}` : ''}
                  </div>
                </TooltipTrigger>
                {column.limit > 0 && columnTasks.length >= column.limit && (
                  <TooltipContent>
                    <p>
                      Column limit{' '}
                      {columnTasks.length > column.limit
                        ? 'exceeded'
                        : 'reached'}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          {can?.(ProjectAction.VIEW_SETTINGS) && (
            <ColumnMenuOptions
              column={column}
              onColumnUpdate={onColumnUpdate}
              onColumnDelete={onColumnDelete}
              onColumnHide={onColumnHide}
            />
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {column.description}
        </div>
      </div>

      {/* Tasks List */}

      <SortableContext
        id={column.id}
        items={columnTasks.map((item) => ({
          ...item,
          id: item.id as UniqueIdentifier,
        }))}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            'flex-1 overflow-y-auto space-y-2 p-2',
            isOver &&
              'bg-gray-200 dark:bg-gray-900 border border-dashed border-gray-400 dark:border-gray-600'
          )}
        >
          {columnTasks.map((item, index) => (
            <TaskItem
              key={item.id}
              item={item}
              projectName={projectName}
              index={index}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add Task Section */}
      <div className="p-2 dark:border-gray-800">
        {showInput ? (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter task title..."
              className="h-8"
              autoFocus
              disabled={isCreating}
            />
            <Button
              onClick={handleAddItem}
              className={cn(successBtnStyles, 'h-8 px-3')}
              disabled={!inputValue.trim() || isCreating}
            >
              {isCreating ? 'Adding...' : 'Add'}
            </Button>
            <Button
              onClick={() => {
                setShowInput(false);
                setInputValue('');
              }}
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={isCreating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowInput(true)}
            className="w-full h-8 bg-transparent text-gray-500 hover:bg-gray-200 hover:dark:bg-gray-900 dark:text-gray-400 flex justify-start"
          >
            <Plus className="w-4 h-4 mr-2" /> Add item
          </Button>
        )}
      </div>
    </div>
  );
};
