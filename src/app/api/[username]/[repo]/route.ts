import { createClient } from '@/lib/apiClient';
import { NextResponse } from 'next/server';

const supabase = createClient();

export async function GET(
  request: Request,
  { params }: { params: { username: string; repo: string } }
) {
  try {
    // Get user ID from username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('name', params.username)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get project/repository
    const { data: repoData, error: repoError } = await supabase
      .from('projects')
      .select(`
        *,
        creator:created_by (
          id,
          name,
          email,
          avatar,
          description,
          links
        )
      `)
      .eq('created_by', userData.id)
      .eq('name', params.repo)
      .single();

    if (repoError || !repoData) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Get latest commit
    const { data: commitData, error: commitError } = await supabase
      .from('commits')
      .select('*')
      .eq('project_id', repoData.id)
      .order('committed_at', { ascending: false })
      .limit(1)
      .single();

    if (commitError) {
      return NextResponse.json(
        { error: 'Error fetching commit data' },
        { status: 500 }
      );
    }

    // Get file tree for latest commit
    const { data: fileTreeData, error: fileTreeError } = await supabase
      .from('file_tree')
      .select('*')
      .eq('commit_id', commitData?.id || '')
      .order('path');

    if (fileTreeError) {
      return NextResponse.json(
        { error: 'Error fetching file tree' },
        { status: 500 }
      );
    }

    // Get project members
    const { data: membersData, error: membersError } = await supabase
      .from('project_members')
      .select(`
        user:users (
          id,
          name,
          avatar,
          description,
          links
        ),
        role
      `)
      .eq('project_id', repoData.id)
      .eq('invitationStatus', 'accepted');

    if (membersError) {
      return NextResponse.json(
        { error: 'Error fetching members' },
        { status: 500 }
      );
    }

    const members = membersData.map(m => ({
      ...m.user,
      role: m.role
    }));

    // Check if current user has permissions
    const session = await supabase.auth.getSession();
    let permissions = {
      read: repoData.is_public,
      write: false,
      admin: false
    };

    if (session.data.session?.user.id) {
      const currentUserMembership = membersData.find(
        m => m.user.id === session.data.session?.user.id
      );
      
      if (currentUserMembership) {
        permissions = {
          read: true,
          write: ['write', 'admin'].includes(currentUserMembership.role),
          admin: currentUserMembership.role === 'admin'
        };
      } else if (repoData.created_by === session.data.session?.user.id) {
        permissions = {
          read: true,
          write: true,
          admin: true
        };
      }
    }

    return NextResponse.json({
      repository: {
        ...repoData,
        members,
        latest_commit: commitData
      },
      files: fileTreeData,
      permissions
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}