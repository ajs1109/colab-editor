'use client';

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ProjectActions } from './ProjectActions';
import { useProjectAccess } from '@/hooks/useProjectAccess';
import { ProjectAction } from '@/consts';

interface ProjectItemProps {
  project: IProject;
  tab: 'active' | 'all' | 'closed';
  setProjectToClose?: (id: string) => void;
  setProjectToReopen?: (id: string) => void;
  setProjectToDelete?: (project: IProject) => void;
}

export const ProjectItem = ({
  project,
  tab,
  setProjectToClose,
  setProjectToReopen,
  setProjectToDelete,
}: ProjectItemProps) => {
  const { can } = useProjectAccess({ projectId: project.id });

  return (
    <div className="p-6 border-b flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2">
          {project.closed ? (
            <h1 className="text-lg font-semibold text-gray-500">
              {project.name}
            </h1>
          ) : (
            <Link href={`/projects/${project.id}`}>
              <h1 className="text-lg font-semibold">{project.name}</h1>
            </Link>
          )}
          {tab === 'all' && (
            <Badge className="text-xs bg-transparent dark:bg-transparent border border-gray-300 text-gray-400 dark:text-gray-600 font-normal">
              {project.closed ? 'Closed' : 'Active'}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
          {project.description}
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          {new Date(project.created_at).toDateString()}
        </p>
      </div>
      {can(ProjectAction.CLOSE_PROJECT) && (
        <ProjectActions
          project={project}
          tab={tab}
          setProjectToClose={setProjectToClose}
          setProjectToReopen={setProjectToReopen}
          setProjectToDelete={setProjectToDelete}
        />
      )}
    </div>
  );
};
