interface EmptyProjectListProps {
  tab: 'active' | 'all' | 'closed';
}

export const EmptyProjectList = ({ tab }: EmptyProjectListProps) => (
  <div className="border rounded-md p-8 text-center text-gray-500">
    <p className="text-lg mb-2">No projects found</p>
    <p className="text-sm">
      {tab === 'active' && "You don't have any active projects yet."}
      {tab === 'closed' && "You don't have any closed projects."}
      {tab === 'all' && "You don't have any projects yet."}
    </p>
  </div>
);
