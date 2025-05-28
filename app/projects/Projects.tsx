'use client';

import { useToast } from '@/components/ui/use-toast';
import { projects } from '@/utils/projects';
import { useMemo, useState } from 'react';
import { CloseProjectDialog } from './components/CloseProjectDialog';
import { ProjectTabs } from './components/ProjectTabs';
import { DeleteProjectDialog } from './components/DeleteProjectDialog';
import { ReopenProjectDialog } from './components/ReopenProjectDialog';

export const Projects = ({
  initialProjects,
}: {
  initialProjects: IProject[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [availableProjects, setAvailableProjects] = useState(initialProjects);
  const [projectToClose, setProjectToClose] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
  const [projectToReopen, setProjectToReopen] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredProjects = useMemo(() => {
    return availableProjects
      .filter((project) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [availableProjects, searchTerm, sortOrder]);

  const activeProjects = filteredProjects.filter((p) => !p.closed);
  const closedProjects = filteredProjects.filter((p) => p.closed);

  const handleSort = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
  };

  const handleCloseProject = async () => {
    if (!projectToClose) return;

    try {
      await projects.management.close(projectToClose);
      setAvailableProjects((prev) =>
        prev.map((project) =>
          project.id === projectToClose ? { ...project, closed: true } : project
        )
      );
      toast({
        title: 'Success',
        description: 'Project closed successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to close project. Please try again.',
      });
    } finally {
      setProjectToClose(null);
    }
  };

  const handleReopenProject = async () => {
    if (!projectToReopen) return;
    try {
      await projects.management.reopen(projectToReopen);
      setAvailableProjects((prev) =>
        prev.map((project) =>
          project.id === projectToReopen
            ? { ...project, closed: false }
            : project
        )
      );
      toast({
        title: 'Success',
        description: 'Project reopened successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reopen project. Please try again.',
      });
    } finally {
      setProjectToReopen(null);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await projects.management.delete(projectToDelete.id);
      setAvailableProjects((prev) =>
        prev.filter((project) => project.id !== projectToDelete.id)
      );
      toast({ title: 'Success', description: 'Project deleted successfully' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete project',
      });
    } finally {
      setProjectToDelete(null);
    }
  };

  return (
    <div>
      <ProjectTabs
        activeProjects={activeProjects}
        closedProjects={closedProjects}
        allProjects={filteredProjects}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOrder={sortOrder}
        onSort={handleSort}
        setProjectToClose={setProjectToClose}
        setProjectToReopen={setProjectToReopen}
        setProjectToDelete={setProjectToDelete}
      />

      <CloseProjectDialog
        open={!!projectToClose}
        onOpenChange={() => setProjectToClose(null)}
        onConfirm={handleCloseProject}
      />

      {projectToDelete && (
        <DeleteProjectDialog
          open={!!projectToDelete}
          onOpenChange={() => setProjectToDelete(null)}
          onConfirm={handleDeleteProject}
          projectName={projectToDelete.name}
        />
      )}

      <ReopenProjectDialog
        open={!!projectToReopen}
        onOpenChange={() => setProjectToReopen(null)}
        onConfirm={handleReopenProject}
      />
    </div>
  );
};
