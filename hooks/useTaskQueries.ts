import { tasks } from '@/utils/tasks';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export interface DateUpdates {
  startDate: string | null;
  endDate: string | null;
}

export const useTaskQueries = (taskId: string) => {
  const queryClient = useQueryClient();

  // Fetch task details with all options
  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasks.details.get(taskId),
    enabled: !!taskId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  // Update task description
  const { mutate: updateDescription } = useMutation({
    mutationFn: (description: string) =>
      tasks.details.update(taskId, { description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  // Update task assignees
  const { mutate: updateAssignees } = useMutation({
    mutationFn: (assigneeIds: string[]) =>
      tasks.details.update(taskId, { assignees: assigneeIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  // Update task labels
  const { mutate: updateLabels } = useMutation({
    mutationFn: (labelIds: string[]) =>
      tasks.details.update(taskId, { labels: labelIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  // Update task status
  const { mutate: updateStatus } = useMutation({
    mutationFn: (statusId: string) =>
      tasks.details.update(taskId, { status_id: statusId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  // Update task priority
  const { mutate: updatePriority } = useMutation({
    mutationFn: (priorityId: string | null) =>
      tasks.details.update(taskId, { priority: priorityId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  // Update task size
  const { mutate: updateSize } = useMutation({
    mutationFn: (sizeId: string | null) =>
      tasks.details.update(taskId, { size: sizeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  // Update task dates
  const { mutate: updateDates } = useMutation({
    mutationFn: (dates: DateUpdates) =>
      tasks.details.updateDates(taskId, dates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });

  // Delete task
  const { mutate: deleteTask } = useMutation({
    mutationFn: () => tasks.details.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    task,
    updateDescription,
    updateAssignees,
    updateLabels,
    updateStatus,
    updatePriority,
    updateSize,
    updateDates,
    deleteTask,
  };
};

export const prefetchTask = async (
  queryClient: QueryClient,
  taskId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasks.details.get(taskId),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
};
