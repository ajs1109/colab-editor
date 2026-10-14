"use server";

import { NextResponse } from "next/server";
import { createClient } from "../server";
import { getFilesAtCommit, getRepoAccess } from "../repo-files";

export const createProject = async (
  projectData: ProjectWithOptions,
  userId: string
) => {
  const supabase = await createClient();
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
        is_public: projectData.is_public
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
};

export const getProject = async (username: string, repo: string) => {
  const supabase = await createClient();

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

    // Get file tree as of the latest commit
    const fileTreeData = await getFilesAtCommit(supabase, repoData.id, commitData.id);

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
      ...(m.user as unknown as IUser),
      role: m.role,
    }));

    // Same permission rules as the commit API.
    const { permissions } = await getRepoAccess(supabase, username, repo);
    if (!permissions.read) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
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
};

// utils/projects.ts
export const getCommits = async (
  username: string,
  repo: string,
  page: number = 1,
  limit: number = 20
) => {
  const supabase = await createClient();

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
};

// utils/projects.ts
export const getCommit = async (
  username: string,
  repo: string,
  commitId: string
) => {
  const supabase = await createClient();

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
      return NextResponse.json({ error: "Commit not found" }, { status: 404 });
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
};
