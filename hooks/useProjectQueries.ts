import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projects } from '@/utils/projects';
import { tasks } from '@/utils/tasks';

export const useProjectQueries = (projectId: string) => {
  const queryClient = useQueryClient();

  // Fetch project tasks
  const { data: projectTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => tasks.board.getProjectTasks(projectId),
    enabled: !!projectId,
    staleTime: Infinity, // Never consider data stale automatically
    gcTime: 1000 * 60 * 30,
  });

  // Fetch project members
  const { data: members, refetch: refetchMembers } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projects.members.getAll(projectId),
    enabled: !!projectId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  // Fetch project labels
  const { data: labels, refetch: refetchLabels } = useQuery({
    queryKey: ['project-labels', projectId],
    queryFn: () => projects.fields.getLabels(projectId),
    enabled: !!projectId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  // Fetch project statuses
  const { data: statuses, refetch: refetchStatuses } = useQuery({
    queryKey: ['project-statuses', projectId],
    queryFn: () => projects.fields.getStatuses(projectId),
    enabled: !!projectId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  // Fetch project priorities
  const { data: priorities, refetch: refetchPriorities } = useQuery({
    queryKey: ['project-priorities', projectId],
    queryFn: () => projects.fields.getPriorities(projectId),
    enabled: !!projectId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  // Fetch project sizes
  const { data: sizes, refetch: refetchSizes } = useQuery({
    queryKey: ['project-sizes', projectId],
    queryFn: () => projects.fields.getSizes(projectId),
    enabled: !!projectId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  // Reload functions
  const reloadProjectTasks = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-tasks', projectId],
    });
    return refetchTasks();
  };

  const reloadMembers = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-members', projectId],
    });
    return refetchMembers();
  };

  const reloadLabels = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-labels', projectId],
    });
    return refetchLabels();
  };

  const reloadStatuses = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-statuses', projectId],
    });
    return refetchStatuses();
  };

  const reloadPriorities = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-priorities', projectId],
    });
    return refetchPriorities();
  };

  const reloadSizes = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-sizes', projectId],
    });
    return refetchSizes();
  };

  return {
    // Data
    projectTasks,
    members,
    labels,
    statuses,
    priorities,
    sizes,
    // Reload functions
    reloadProjectTasks,
    reloadMembers,
    reloadLabels,
    reloadStatuses,
    reloadPriorities,
    reloadSizes,
  };
};
