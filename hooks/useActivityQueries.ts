import { activities } from '@/utils/activities';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const useActivityQueries = (taskId: string) => {
  const queryClient = useQueryClient();

  // Fetch all activities for a task
  const { data: taskActivities, isLoading } = useQuery<ActivityResponse[]>({
    queryKey: ['activities', taskId],
    queryFn: () => activities.getTaskActivities(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Create a new activity
  const { mutate: createActivity } = useMutation({
    mutationFn: (newActivity: {
      task_id: string;
      user_id: string;
      content: TaskActivity;
    }) => activities.create(newActivity),
    onSuccess: (newActivity) => {
      // Optimistically update the activities list
      queryClient.setQueryData<ActivityResponse[]>(
        ['activities', taskId],
        (oldActivities) => {
          if (!oldActivities) return [newActivity];
          return [newActivity, ...oldActivities];
        }
      );
    },
  });

  // Create multiple activities at once
  const { mutate: createActivities } = useMutation({
    mutationFn: (
      newActivities: {
        task_id: string;
        user_id: string;
        content: TaskActivity;
      }[]
    ) => activities.createMany(newActivities),
    onSuccess: (newActivities) => {
      // Optimistically update the activities list
      queryClient.setQueryData<ActivityResponse[]>(
        ['activities', taskId],
        (oldActivities) => {
          if (!oldActivities) return newActivities;
          return [...newActivities, ...oldActivities];
        }
      );
    },
  });

  // Delete an activity
  const { mutate: deleteActivity } = useMutation({
    mutationFn: (activityId: string) => activities.delete(activityId),
    onSuccess: (_, activityId) => {
      // Optimistically update the activities list
      queryClient.setQueryData<ActivityResponse[]>(
        ['activities', taskId],
        (oldActivities) => {
          if (!oldActivities) return [];
          return oldActivities.filter((activity) => activity.id !== activityId);
        }
      );
    },
  });

  // Update an activity
  const { mutate: updateActivity } = useMutation({
    mutationFn: ({
      activityId,
      updates,
    }: {
      activityId: string;
      updates: Partial<Pick<ActivityResponse, 'content'>>;
    }) => activities.update(activityId, updates),
    onSuccess: (updatedActivity) => {
      // Optimistically update the activities list
      queryClient.setQueryData<ActivityResponse[]>(
        ['activities', taskId],
        (oldActivities) => {
          if (!oldActivities) return [updatedActivity];
          return oldActivities.map((activity) =>
            activity.id === updatedActivity.id ? updatedActivity : activity
          );
        }
      );
    },
  });

  return {
    taskActivities,
    isLoading,
    createActivity,
    createActivities,
    deleteActivity,
    updateActivity,
  };
};

// Helper function to prefetch activities
export const prefetchActivities = async (
  queryClient: QueryClient,
  taskId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ['activities', taskId],
    queryFn: () => activities.getTaskActivities(taskId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
