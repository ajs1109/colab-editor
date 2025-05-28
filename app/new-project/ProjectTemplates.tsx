import React from 'react';
import { ProjectTemplateCard } from './ProjectTemplateCard';

export const ProjectTemplates = () => {
  return (
    <div className="py-2">
      <div className="flex gap-4">
        <ProjectTemplateCard
          title="Kanban"
          description="Visualize the status of your project and limit work in progress"
        />
        <ProjectTemplateCard
          title="Team Retrospective"
          description="Reflect as a team what went well, what can be improved next time, and action items"
        />
      </div>
    </div>
  );
};
