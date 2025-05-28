import { projects } from '@/utils/projects';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const useProjectOwner = (projectId: string) => {
  const {
    data: owner,
    isLoading,
    error,
  } = useQuery<IUser | null>({
    queryKey: ['project', projectId, 'owner'],
    queryFn: () => projects.members.getProjectOwner(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    owner,
    isLoading,
    error,
  };
};

// Helper function to prefetch project owner
export const prefetchProjectOwner = async (
  queryClient: QueryClient,
  projectId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ['project', projectId, 'owner'],
    queryFn: () => projects.members.getProjectOwner(projectId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
