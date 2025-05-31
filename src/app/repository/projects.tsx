import React from 'react';
import { useRepository } from '@/hooks/useRepository';
import ProjectBoard from '@/components/ProjectBoard';

const RepositoryProjectsPage = () => {
  const { projects, loading, error } = useRepository();

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error loading projects: {error.message}</div>;

  return (
    <div>
      <h1>Projects</h1>
      {projects.length === 0 ? (
        <p>No projects found for this repository.</p>
      ) : (
        <ProjectBoard projects={projects} />
      )}
    </div>
  );
};

export default RepositoryProjectsPage;