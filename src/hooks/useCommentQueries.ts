import { comments } from '@/utils/comments';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const useCommentQueries = (taskId: string) => {
  const queryClient = useQueryClient();

  // Fetch all comments for a task
  const { data: taskComments, isLoading } = useQuery<CommentResponse[]>({
    queryKey: ['comments', taskId],
    queryFn: () => comments.getTaskComments(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Create a new comment
  const { mutate: createComment } = useMutation({
    mutationFn: (newComment: {
      task_id: string;
      user_id: string;
      content: string;
    }) => comments.create(newComment),
    onSuccess: (newComment) => {
      // Optimistically update the comments list
      queryClient.setQueryData<CommentResponse[]>(
        ['comments', taskId],
        (oldComments) => {
          if (!oldComments) return [newComment];
          return [...oldComments, newComment]; // Add to end since we show oldest first
        }
      );
    },
  });

  // Delete a comment
  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: string) => comments.delete(commentId),
    onSuccess: (_, commentId) => {
      // Optimistically update the comments list
      queryClient.setQueryData<CommentResponse[]>(
        ['comments', taskId],
        (oldComments) => {
          if (!oldComments) return [];
          return oldComments.filter((comment) => comment.id !== commentId);
        }
      );
    },
  });

  // Update a comment
  const { mutate: updateComment } = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => comments.update(commentId, { content }),
    onSuccess: (updatedComment) => {
      // Optimistically update the comments list
      queryClient.setQueryData<CommentResponse[]>(
        ['comments', taskId],
        (oldComments) => {
          if (!oldComments) return [updatedComment];
          return oldComments.map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment
          );
        }
      );
    },
  });

  return {
    taskComments,
    isLoading,
    createComment,
    deleteComment,
    updateComment,
  };
};

// Helper function to prefetch comments
export const prefetchComments = async (
  queryClient: QueryClient,
  taskId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ['comments', taskId],
    queryFn: () => comments.getTaskComments(taskId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
