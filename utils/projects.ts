import { createClient } from './supabase/client';

const supabase = createClient();

export const projects = {
  // Project management
  management: {
    create: async (projectData: ProjectWithOptions, userId: string) => {
      try {
        // 1. Create the project first
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: projectData.name,
            description: projectData.description,
            readme: projectData.readme,
            created_by: userId,
            updated_at: new Date(),
            closed: false,
          })
          .select()
          .single();

        if (projectError) throw projectError;

        // 2. If not skipping default options, create them
        if (projectData.statuses) {
          const { error: statusError } = await supabase.from('statuses').insert(
            projectData.statuses.map((status, index) => ({
              ...status,
              project_id: project.id,
              order: index,
              limit: 5,
              updated_at: new Date(),
            }))
          );
          if (statusError) throw statusError;
        }

        if (projectData.labels) {
          const { error: labelError } = await supabase.from('labels').insert(
            projectData.labels.map((label) => ({
              ...label,
              project_id: project.id,
              updated_at: new Date(),
            }))
          );
          if (labelError) throw labelError;
        }

        if (projectData.priorities) {
          const { error: priorityError } = await supabase
            .from('priorities')
            .insert(
              projectData.priorities.map((priority) => ({
                ...priority,
                project_id: project.id,
                updated_at: new Date(),
              }))
            );
          if (priorityError) throw priorityError;
        }

        if (projectData.sizes) {
          const { error: sizeError } = await supabase.from('sizes').insert(
            projectData.sizes.map((size) => ({
              ...size,
              project_id: project.id,
              updated_at: new Date(),
            }))
          );
          if (sizeError) throw sizeError;
        }

        return project;
      } catch (error) {
        throw error;
      }
    },
    update: async (projectId: string, updates: Partial<IProject>) => {
      const { error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date(),
        })
        .eq('id', projectId);

      if (error) throw error;
    },
    delete: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    close: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .update({
          closed: true,
          updated_at: new Date(),
        })
        .eq('id', projectId);

      if (error) throw error;
    },
    reopen: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .update({
          closed: false,
          updated_at: new Date(),
        })
        .eq('id', projectId);

      if (error) throw error;
    },
  },

  // Project options/fields
  fields: {
    getStatuses: async (projectId: string) => {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .eq('project_id', projectId)
        .order('order');

      if (error) throw error;
      return data;
    },
    getLabels: async (projectId: string) => {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      return data;
    },
    getPriorities: async (projectId: string) => {
      const { data, error } = await supabase
        .from('priorities')
        .select('*')
        .eq('project_id', projectId)
        .order('order');

      if (error) throw error;
      return data;
    },
    getSizes: async (projectId: string) => {
      const { data, error } = await supabase
        .from('sizes')
        .select('*')
        .eq('project_id', projectId)
        .order('order');

      if (error) throw error;
      return data;
    },
  },

  // Project members
  members: {
    getAll: async (projectId: string) => {
      const { data, error } = await supabase
        .from('project_members')
        .select(
          `
          user:users (
            id,
            name,
            avatar,
            description,
            links
          )
        `
        )
        .eq('project_id', projectId);

      if (error) throw error;
      return (data as any[]).map((m) => m.user) as IUser[];
    },
    getProjectOwner: async (projectId: string) => {
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          creator:created_by (
            id,
            name,
            email,
            avatar,
            description,
            links,
            created_at,
            updated_at
          )
        `
        )
        .eq('id', projectId)
        .single();

      if (error) throw error;
      if (!data?.creator) return null;

      const creator = data.creator as Record<string, any>;

      return {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        avatar: creator.avatar,
        description: creator.description,
        links: creator.links,
        created_at: creator.created_at,
        updated_at: creator.updated_at,
      } as IUser;
    },
  },

  // User's projects
  getUserProjects: async (userId: string) => {
    const [ownedProjects, memberProjects] = await Promise.all([
      // Get projects created by user
      supabase
        .from('projects')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false }),

      // Get projects where user is a member
      supabase
        .from('project_members')
        /* Get all fields from the projects table and alias it as 'project' */
        .select(
          `
          project:projects (*) 
        `
        )
        .eq('user_id', userId)
        .eq('invitationStatus', 'accepted')
        .order('created_at', { ascending: false })
        .not('project.created_by', 'eq', userId),
    ]);

    if (ownedProjects.error) throw ownedProjects.error;
    if (memberProjects.error) throw memberProjects.error;

    // Combine and deduplicate projects
    const allProjects = [
      ...ownedProjects.data,
      ...memberProjects.data.map((row) => row.project),
    ];

    return allProjects as IProject[];
  },
};
