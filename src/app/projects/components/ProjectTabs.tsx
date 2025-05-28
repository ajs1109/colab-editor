'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelsTopLeft, SquareKanban } from 'lucide-react';
import SearchAndButton from '../Search';
import { ProjectList } from '../ProjectList';

interface ProjectTabsProps {
  activeProjects: IProject[];
  closedProjects: IProject[];
  allProjects: IProject[];
  searchTerm: string;
  setSearchTerm?: (term: string) => void;
  sortOrder: 'newest' | 'oldest';
  onSort?: (order: 'newest' | 'oldest') => void;
  setProjectToClose?: (id: string) => void;
  setProjectToReopen?: (id: string) => void;
  setProjectToDelete?: (project: IProject) => void;
}

export const ProjectTabs = ({
  activeProjects,
  closedProjects,
  allProjects,
  searchTerm,
  setSearchTerm,
  sortOrder,
  onSort,
  setProjectToClose,
  setProjectToReopen,
  setProjectToDelete,
}: ProjectTabsProps) => (
  <Tabs defaultValue="active-projects">
    <TabsList className="bg-slate-100 dark:bg-slate-900 rounded-none">
      <TabsTrigger value="active-projects">
        <PanelsTopLeft className="w-4 h-4 mr-2" />
        <span>Active Projects</span>
      </TabsTrigger>
      <TabsTrigger value="closed-projects">
        <SquareKanban className="w-4 h-4 mr-2" />
        <span>Closed Projects</span>
      </TabsTrigger>
      <TabsTrigger value="all-projects">
        <SquareKanban className="w-4 h-4 mr-2" />
        <span>All Projects</span>
      </TabsTrigger>
    </TabsList>

    <TabsContent value="active-projects">
      <SearchAndButton
        placeholderText="Search active projects"
        onSearch={setSearchTerm}
      />
      <ProjectList
        tab="active"
        projects={activeProjects}
        sortOrder={sortOrder}
        onSort={onSort}
        setProjectToClose={setProjectToClose}
        setProjectToReopen={setProjectToReopen}
        setProjectToDelete={setProjectToDelete}
      />
    </TabsContent>
    <TabsContent value="closed-projects">
      <SearchAndButton
        placeholderText="Search closed projects"
        onSearch={setSearchTerm}
      />
      <ProjectList
        tab="closed"
        projects={closedProjects}
        sortOrder={sortOrder}
        onSort={onSort}
        setProjectToClose={setProjectToClose}
        setProjectToReopen={setProjectToReopen}
        setProjectToDelete={setProjectToDelete}
      />
    </TabsContent>
    <TabsContent value="all-projects">
      <SearchAndButton
        placeholderText="Search all projects"
        onSearch={setSearchTerm}
      />
      <ProjectList
        tab="all"
        projects={allProjects}
        sortOrder={sortOrder}
        onSort={onSort}
        setProjectToClose={setProjectToClose}
        setProjectToReopen={setProjectToReopen}
        setProjectToDelete={setProjectToDelete}
      />
    </TabsContent>
  </Tabs>
);
