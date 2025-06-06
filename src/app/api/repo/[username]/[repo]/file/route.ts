import { createClient } from '@/lib/apiClient';
import { NextResponse } from 'next/server';

const supabase = createClient();

export async function GET(
  request: Request,
  { params }: { params: { username: string; repo: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }

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
      .select('id')
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
      .select('id')
      .eq('project_id', repoData.id)
      .order('committed_at', { ascending: false })
      .limit(1)
      .single();

    if (commitError || !commitData) {
      return NextResponse.json(
        { error: 'Error fetching commit data' },
        { status: 500 }
      );
    }

    // Get file content
    const { data: fileData, error: fileError } = await supabase
      .from('file_tree')
      .select('*')
      .eq('commit_id', commitData.id)
      .eq('path', path)
      .single();

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(fileData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { username: string; repo: string } }
) {
  try {
    const { path, content } = await request.json();

    if (!path || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content are required' },
        { status: 400 }
      );
    }

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
      .select('id, created_by')
      .eq('created_by', userData.id)
      .eq('name', params.repo)
      .single();

    if (repoError || !repoData) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: membershipData, error: membershipError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', repoData.id)
      .eq('user_id', session.data.session.user.id)
      .single();

    const isOwner = repoData.created_by === session.data.session.user.id;
    const canWrite = isOwner || membershipData?.role === 'write' || membershipData?.role === 'admin';

    if (!canWrite) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get latest commit
    const { data: commitData, error: commitError } = await supabase
      .from('commits')
      .select('id')
      .eq('project_id', repoData.id)
      .order('committed_at', { ascending: false })
      .limit(1)
      .single();

    if (commitError || !commitData) {
      return NextResponse.json(
        { error: 'Error fetching commit data' },
        { status: 500 }
      );
    }

    // Update file content
    const { data: fileData, error: fileError } = await supabase
      .from('file_tree')
      .update({ content })
      .eq('commit_id', commitData.id)
      .eq('path', path)
      .select()
      .single();

    if (fileError) {
      return NextResponse.json(
        { error: 'Error updating file' },
        { status: 500 }
      );
    }

    // Create a new commit for this change
    const { data: newCommitData, error: commitCreateError } = await supabase
      .from('commits')
      .insert({
        project_id: repoData.id,
        message: `Update ${path}`,
        committer_id: session.data.session.user.id,
        parent_commit_id: commitData.id
      })
      .select()
      .single();

    if (commitCreateError) {
      return NextResponse.json(
        { error: 'Error creating commit' },
        { status: 500 }
      );
    }

    // Create file change record
    const { error: changeError } = await supabase
      .from('file_changes')
      .insert({
        commit_id: newCommitData.id,
        file_id: fileData.id,
        change_type: 'modified',
        old_path: path,
        new_path: path,
        old_content: fileData.content,
        new_content: content,
        additions: content.split('\n').length - (fileData.content?.split('\n').length || 0),
        deletions: 0
      });

    if (changeError) {
      return NextResponse.json(
        { error: 'Error recording file change' },
        { status: 500 }
      );
    }

    return NextResponse.json(fileData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}