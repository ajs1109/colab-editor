'use client';
import { useTaskDetails } from '../Board/TaskDetailsContext';
import { useProjectQueries } from '@/hooks/useProjectQueries';
import { useTaskQueries, DateUpdates } from '@/hooks/useTaskQueries';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DatePicker } from './DatePicker';
import { CustomFieldTagRenderer } from '@/components/CustomFieldTagRenderer';
import { toast } from '@/components/ui/use-toast';
import { tasks as tasksUtils } from '@/utils/tasks';

export const Project = () => {
  const params = useParams();
  const { selectedTask, projectName, updateTaskSize, updateTaskPriority } =
    useTaskDetails();
  const { projectTasks, statuses, priorities, sizes } = useProjectQueries(
    params.projectId as string
  );
  const { task, updatePriority, updateSize, updateDates } = useTaskQueries(
    selectedTask?.id || ''
  );

  const calculateNewStatusPosition = (
    tasks: ITaskWithOptions[],
    newPriorityOrder: number | null,
    currentStatusId: string
  ): number => {
    const columnTasks = tasks.filter(
      (task) => task.status_id === currentStatusId
    );

    // If no priority (removing priority), place at bottom
    if (!newPriorityOrder) {
      const nonPriorityTasks = columnTasks.filter((task) => !task.priority);
      if (nonPriorityTasks.length === 0) {
        return (columnTasks[columnTasks.length - 1]?.statusPosition ?? 0) - 10;
      }
      return (
        Math.min(...nonPriorityTasks.map((t) => t.statusPosition ?? 0)) - 10
      );
    }

    // Find tasks with same or higher priority order
    const tasksWithSameOrHigherPriority = columnTasks.filter(
      (task) => (task.priority?.order ?? 0) >= newPriorityOrder
    );

    // Find tasks with same priority order
    const tasksWithSamePriority = columnTasks.filter(
      (task) => task.priority?.order === newPriorityOrder
    );

    // Find tasks with next lower priority order
    const tasksWithNextLowerPriority = columnTasks.filter(
      (task) => task.priority?.order === newPriorityOrder - 1
    );

    if (tasksWithSameOrHigherPriority.length === 0) {
      // No tasks with same or higher priority, place at top
      return (
        (Math.max(...columnTasks.map((t) => t.statusPosition ?? 0)) ?? 0) + 100
      );
    }

    if (tasksWithSamePriority.length > 0) {
      // Place below the last task with same priority
      const lastSamePriorityTask =
        tasksWithSamePriority[tasksWithSamePriority.length - 1];
      return (lastSamePriorityTask.statusPosition ?? 0) - 100;
    }

    if (tasksWithNextLowerPriority.length > 0) {
      // Place above the first task with next lower priority
      const firstNextLowerPriorityTask = tasksWithNextLowerPriority[0];
      return (firstNextLowerPriorityTask.statusPosition ?? 0) + 100;
    }

    // Default: place at a reasonable position
    return (
      (Math.max(...columnTasks.map((t) => t.statusPosition ?? 0)) ?? 0) + 100
    );
  };

  const handlePrioritySelect = async (priorityId: string | null) => {
    if (!selectedTask?.id) return;

    const priority = priorityId
      ? priorities?.find((p) => p.id === priorityId) || null
      : null;

    const newStatusPosition = calculateNewStatusPosition(
      projectTasks || [],
      priority?.order ?? null,
      selectedTask.status_id || ''
    );

    try {
      // Update both priority and position
      await tasksUtils.board.updatePosition(selectedTask.id, newStatusPosition);
      await updatePriority(priorityId || null);

      // Update local state
      updateTaskPriority?.(selectedTask.id, priority);
    } catch (error) {
      toast({
        title: 'Failed to update priority',
        variant: 'destructive',
      });
    }
  };

  const handleSizeSelect = (sizeId: string | null) => {
    if (!selectedTask?.id) return;
    updateSize(sizeId || null);
    const size = sizeId ? sizes?.find((s) => s.id === sizeId) || null : null;
    updateTaskSize?.(selectedTask.id, size);
  };

  const handleDateChange = (
    type: 'startDate' | 'endDate',
    date: Date | undefined
  ) => {
    if (!selectedTask?.id) return;

    const updates: DateUpdates = {
      startDate:
        type === 'startDate'
          ? date?.toISOString() || null
          : (task?.startDate as any) || null,
      endDate:
        type === 'endDate'
          ? date?.toISOString() || null
          : (task?.endDate as any) || null,
    };
    updateDates(updates);
  };

  const currentStatus = statuses?.find((s) => s.id === task?.status_id);

  const startDate = task?.startDate ? new Date(task.startDate) : undefined;
  const endDate = task?.endDate ? new Date(task.endDate) : undefined;

  const sortedPriorities = priorities?.sort((a, b) => a.order - b.order);
  const sortedSizes = sizes?.sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="py-4">
        <span className="text-gray-500 text-xs">Project</span>
        <p className="text-xs py-1">{projectName}</p>
      </div>

      <div className="flex gap-8 items-center text-gray-500">
        <span className="text-xs">Status</span>
        <Badge
          variant="secondary"
          className="text-[11px] bg-blue-100 text-blue-700 border-blue-300 dark:text-blue-300 dark:bg-blue-950 border dark:border-blue-800"
        >
          {currentStatus?.label || 'None'}
        </Badge>
      </div>

      <div className="flex justify-between text-gray-500 py-2">
        <span className="text-xs">Priority</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-xs">
            {task?.priority ? (
              <CustomFieldTagRenderer
                color={task.priority.color}
                label={task.priority.label}
              />
            ) : (
              'None'
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-4">
            <DropdownMenuLabel className="text-xs">
              Set Priority
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handlePrioritySelect(null)}>
              <span className="w-3 h-3 mr-2" />
              <div className="flex-grow">None</div>
            </DropdownMenuItem>
            {sortedPriorities?.map((priority) => (
              <DropdownMenuItem
                key={priority.id}
                onClick={() => handlePrioritySelect(priority.id)}
              >
                <span
                  className="w-3 h-3 mr-2 border rounded-full"
                  style={{ borderColor: priority.color }}
                />
                <div className="flex-grow">{priority.label}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex justify-between text-gray-500 py-2">
        <span className="text-xs">Size</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-xs">
            {task?.size ? (
              <CustomFieldTagRenderer
                color={task.size.color}
                label={task.size.label}
              />
            ) : (
              'None'
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-4">
            <DropdownMenuLabel className="text-xs">Set Size</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSizeSelect(null)}>
              <span className="w-3 h-3 mr-2" />
              <div className="flex-grow">None</div>
            </DropdownMenuItem>
            {sortedSizes?.map((size) => (
              <DropdownMenuItem
                key={size.id}
                onClick={() => handleSizeSelect(size.id)}
              >
                <span
                  className="w-3 h-3 mr-2 border rounded-full"
                  style={{ borderColor: size.color }}
                />
                <div className="flex-grow">{size.label}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex justify-between text-gray-500 py-2">
        <span className="text-xs">Start date</span>
        <DatePicker
          date={startDate}
          onSelect={(date) => handleDateChange('startDate', date)}
        />
      </div>

      <div className="flex justify-between text-gray-500 pt-2 pb-4">
        <span className="text-xs">End date</span>
        <DatePicker
          date={endDate}
          onSelect={(date) => handleDateChange('endDate', date)}
        />
      </div>
    </>
  );
};
