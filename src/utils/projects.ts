import { createClient } from "@/lib/apiClient";
import { NextResponse } from "next/server";

const supabase = createClient();
export const projects = {
  // Project management
  management: {
    create: async (projectData: ProjectWithOptions, userId: string) => {
      try {
        // 1. Create the project first
        const { data: project, error: projectError } = await supabase
          .from("projects")
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

        const { error: projectMembersError } = await supabase
          .from("project_members")
          .insert({
            project_id: project.id,
            user_id: userId,
            invitationStatus: "accepted",
          });

        if (projectMembersError) throw projectError;

        const { error: commitError } = await supabase.from("commits").insert({
          project_id: project.id,
          message: "Initial commit",
          committer_id: userId,
          committed_at: new Date(),
        });

        if (commitError) throw commitError;

        return project;
      } catch (error) {
        throw error;
      }
    },
    update: async (projectId: string, updates: Partial<IProject>) => {
      const { error } = await supabase
        .from("projects")
        .update({
          ...updates,
          updated_at: new Date(),
        })
        .eq("id", projectId);

      if (error) throw error;
    },
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

  // Project options/fields
  fields: {
    getStatuses: async (projectId: string) => {
      const { data, error } = await supabase
        .from("statuses")
        .select("*")
        .eq("project_id", projectId)
        .order("order");

      if (error) throw error;
      return data;
    },
    getLabels: async (projectId: string) => {
      const { data, error } = await supabase
        .from("labels")
        .select("*")
        .eq("project_id", projectId);

      if (error) throw error;
      return data;
    },
    getPriorities: async (projectId: string) => {
      const { data, error } = await supabase
        .from("priorities")
        .select("*")
        .eq("project_id", projectId)
        .order("order");

      if (error) throw error;
      return data;
    },
    getSizes: async (projectId: string) => {
      const { data, error } = await supabase
        .from("sizes")
        .select("*")
        .eq("project_id", projectId)
        .order("order");

      if (error) throw error;
      return data;
    },
  },

  // Project members
  members: {
    getAll: async (projectId: string) => {
      const { data, error } = await supabase
        .from("project_members")
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
        .eq("project_id", projectId);

      if (error) throw error;
      return (data as any[]).map((m) => m.user) as IUser[];
    },
    getProjectOwner: async (projectId: string) => {
      const { data, error } = await supabase
        .from("projects")
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
        .eq("id", projectId)
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

  getProject: async (username: string, repo: string) => {
    try {
      // Get user ID from username
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("name", username)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get project/repository
      const { data: repoData, error: repoError } = await supabase
        .from("projects")
        .select(
          `
            *,
            creator:created_by (
              id,
              name,
              email,
              avatar,
              description,
              links
            )
          `
        )
        .eq("created_by", userData.id)
        .eq("name", repo)
        .single();

      if (repoError || !repoData) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }

      // Get latest commit
      const { data: commitData, error: commitError } = await supabase
        .from("commits")
        .select("*")
        .eq("project_id", repoData.id)
        .order("committed_at", { ascending: false })
        .limit(1)
        .single();

      if (commitError) {
        return NextResponse.json(
          { error: "Error fetching commit data" },
          { status: 500 }
        );
      }

      // Get file tree for latest commit
      const { data: fileTreeData, error: fileTreeError } = await supabase
        .from("file_tree")
        .select("*")
        .eq("commit_id", commitData?.id || "")
        .order("path");

      if (fileTreeError) {
        return NextResponse.json(
          { error: "Error fetching file tree" },
          { status: 500 }
        );
      }

      // Get project members
      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select(
          `
            user:users (
              id,
              name,
              avatar,
              description,
              links
            ),
            role
          `
        )
        .eq("project_id", repoData.id)
        .eq("invitationStatus", "accepted");

      if (membersError) {
        return NextResponse.json(
          { error: "Error fetching members" },
          { status: 500 }
        );
      }

      const members = membersData.map((m) => ({
        ...m.user,
        role: m.role,
      }));

      // Check if current user has permissions

      const authUser = await supabase.auth.getUser();
      const session = await supabase.auth.getSession();
      let permissions = {
        read: repoData.is_public,
        write: false,
        admin: false,
      };

      if (session.data.session?.user.id) {
        const currentUserMembership = membersData.find(
          (m) => m.user.id === session.data.session?.user.id
        );

        if (currentUserMembership) {
          permissions = {
            read: true,
            write: ["write", "admin"].includes(currentUserMembership.role),
            admin: currentUserMembership.role === "admin",
          };
        } else if (repoData.created_by === session.data.session?.user.id) {
          permissions = {
            read: true,
            write: true,
            admin: true,
          };
        }
      }

      return NextResponse.json({
        repository: {
          ...repoData,
          members,
          latest_commit: commitData,
        },
        files: fileTreeData,
        permissions,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },

  // utils/projects.ts
  getCommits: async (
    username: string,
    repo: string,
    page: number = 1,
    limit: number = 20
  ) => {
    try {
      // Get user ID from username
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("name", username)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get project/repository
      const { data: repoData, error: repoError } = await supabase
        .from("projects")
        .select("id, created_by, is_public")
        .eq("created_by", userData.id)
        .eq("name", repo)
        .single();

      if (repoError || !repoData) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }

      // Calculate pagination
      const offset = (page - 1) * limit;

      // Get commits with pagination and file changes
      const { data: commitsData, error: commitsError } = await supabase
        .from("commits")
        .select(
          `
          *,
          committer:committer_id (
            id,
            name,
            avatar
          ),
          file_changes (
            id,
            file_id,
            change_type,
            old_path,
            new_path,
            additions,
            deletions
          )
        `
        )
        .eq("project_id", repoData.id)
        .order("committed_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (commitsError) {
        return NextResponse.json(
          { error: "Error fetching commits" },
          { status: 500 }
        );
      }

      // Get total count for pagination
      const { count } = await supabase
        .from("commits")
        .select("*", { count: "exact", head: true })
        .eq("project_id", repoData.id);

      // Check permissions
      const session = await supabase.auth.getSession();
      let permissions = {
        read: repoData.is_public,
        write: false,
        admin: false,
      };

      if (session.data.session?.user.id) {
        const { data: membershipData, error: membershipError } = await supabase
          .from("project_members")
          .select("role")
          .eq("project_id", repoData.id)
          .eq("user_id", session.data.session.user.id)
          .single();

        const isOwner = repoData.created_by === session.data.session.user.id;
        const canWrite =
          isOwner ||
          membershipData?.role === "write" ||
          membershipData?.role === "admin";

        if (canWrite) {
          permissions = {
            read: true,
            write: true,
            admin: isOwner || membershipData?.role === "admin",
          };
        }
      }

      return NextResponse.json({
        commits: commitsData,
        total: count || 0,
        page,
        limit,
        permissions,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },

  // utils/projects.ts
  getCommit: async (username: string, repo: string, commitId: string) => {
    try {
      // Get user ID from username
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("name", username)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get project/repository
      const { data: repoData, error: repoError } = await supabase
        .from("projects")
        .select("id, created_by, is_public")
        .eq("created_by", userData.id)
        .eq("name", repo)
        .single();

      if (repoError || !repoData) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }

      // Get commit details
      const { data: commitData, error: commitError } = await supabase
        .from("commits")
        .select(
          `
          *,
          committer:committer_id (
            id,
            name,
            avatar,
            email
          ),
          parent_commit:parent_commit_id (
            id,
            message
          )
        `
        )
        .eq("id", commitId)
        .eq("project_id", repoData.id)
        .single();

      if (commitError || !commitData) {
        return NextResponse.json(
          { error: "Commit not found" },
          { status: 404 }
        );
      }

      // Get file changes for this commit
      const { data: changesData, error: changesError } = await supabase
        .from("file_changes")
        .select(
          `
          *,
          file:file_id (
            id,
            name,
            path,
            type
          )
        `
        )
        .eq("commit_id", commitId)
        .order("created_at");

      if (changesError) {
        return NextResponse.json(
          { error: "Error fetching file changes" },
          { status: 500 }
        );
      }

      // Check permissions
      const session = await supabase.auth.getSession();
      let permissions = {
        read: repoData.is_public,
        write: false,
        admin: false,
      };

      if (session.data.session?.user.id) {
        const { data: membershipData, error: membershipError } = await supabase
          .from("project_members")
          .select("role")
          .eq("project_id", repoData.id)
          .eq("user_id", session.data.session.user.id)
          .single();

        const isOwner = repoData.created_by === session.data.session.user.id;
        const canWrite =
          isOwner ||
          membershipData?.role === "write" ||
          membershipData?.role === "admin";

        if (canWrite) {
          permissions = {
            read: true,
            write: true,
            admin: isOwner || membershipData?.role === "admin",
          };
        }
      }

      return NextResponse.json({
        commit: commitData,
        changes: changesData,
        permissions,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },

  getLatestCommit: async (username: string, repo: string) => {
    try {
      // Get user ID from username
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("name", username)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get project/repository
      const { data: repoData, error: repoError } = await supabase
        .from("projects")
        .select("id, created_by, is_public")
        .eq("name", repo)
        .eq("created_by", userData.id)
        .single();

      if (repoError || !repoData) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }

      const session = await supabase.auth.getSession();
      if (session.data.session?.user.id) {
        const { data: membershipData, error: membershipError } = await supabase
          .from("project_members")
          .select("role")
          .eq("project_id", repoData.id)
          .eq("user_id", session.data.session.user.id)
          .single();

        const isOwner = repoData.created_by === session.data.session.user.id;
        if (isOwner || membershipData) {
          // Get latest commit
          const { data: commitData, error: commitError } = await supabase
            .from("commits")
            .select("*")
            .eq("project_id", repoData.id)
            .order("committed_at", { ascending: false })
            .limit(1)
            .single();

          if (commitError || !commitData) {
            return NextResponse.json(
              { error: "No commits found" },
              { status: 404 }
            );
          }

          // Check permissions
          let permissions = {
            read: repoData.is_public,
            write: false,
            admin: false,
          };

          return NextResponse.json({
            commit: commitData,
          });
        }
      }

      return NextResponse.json(
        { error: "You do not have permission to view this repository" },
        { status: 403 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
};
