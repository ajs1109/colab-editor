import { createClient } from "@/lib/apiClient";

const supabase = createClient();
export const projects = {
  // Project management
  management: {
    delete: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
    },
    close: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .update({
          closed: true,
          updated_at: new Date(),
        })
        .eq("id", projectId);

      if (error) throw error;
    },
    reopen: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .update({
          closed: false,
          updated_at: new Date(),
        })
        .eq("id", projectId);

      if (error) throw error;
    },
  },

  // User's projects
  getUserProjects: async (userId: string) => {
    const [ownedProjects, memberProjects] = await Promise.all([
      // Get projects created by user
      await supabase
        .from("projects")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false }),

      // Get projects where user is a member
      supabase
        .from("project_members")
        /* Get all fields from the projects table and alias it as 'project' */
        .select(
          `
          project:projects (*) 
        `
        )
        .eq("user_id", userId)
        .eq("invitationStatus", "accepted")
        .order("created_at", { ascending: false })
        .not("project.created_by", "eq", userId),
    ]);

    if (ownedProjects.error) throw ownedProjects.error;
    if (memberProjects.error) throw memberProjects.error;

    // Combine and deduplicate projects
    const allProjects = [
      ...ownedProjects.data,
      ...memberProjects.data
        .filter((row) => row.project != null)
        .map((row) => row.project),
    ];

    return allProjects as IProject[];
  },
};
