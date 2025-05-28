'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { deleteBtnStyles } from '@/app/commonStyles';
import Link from 'next/link';

interface ProjectActionsProps {
  project: IProject;
  tab: 'active' | 'all' | 'closed';
  setProjectToClose?: (id: string) => void;
  setProjectToReopen?: (id: string) => void;
  setProjectToDelete?: (project: IProject) => void;
}

export const ProjectActions = ({
  project,
  tab,
  setProjectToClose,
  setProjectToReopen,
  setProjectToDelete,
}: ProjectActionsProps) => (
  <div className="relative">
    <DropdownMenu>
      <DropdownMenuTrigger className="font-bold">. . .</DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {tab === 'closed' || (tab === 'all' && project.closed) ? (
          <>
            <DropdownMenuItem onClick={() => setProjectToReopen?.(project.id)}>
              ReOpen
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(deleteBtnStyles)}
              onClick={() => setProjectToDelete?.(project)}
            >
              Delete Permanently
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}/settings`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(deleteBtnStyles)}
              onClick={() => setProjectToClose?.(project.id)}
            >
              Close
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
