'use client';

import { prefetchProjectOwner } from '@/hooks/useProjectOwner';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export function ProjectLayoutClient() {
  const params = useParams();
  const queryClient = useQueryClient();

  //This ensures the project owner data is available before it's needed in any child components.
  useEffect(() => {
    if (params.projectId) {
      prefetchProjectOwner(queryClient, params.projectId as string);
    }
  }, [params.projectId, queryClient]);

  return null;
}
