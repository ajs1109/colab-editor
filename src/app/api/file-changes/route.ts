// app/api/file-changes/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const { 
    commitId, 
    filePath, 
    fileName, 
    fileType, 
    content, 
    changeType, 
    extension, 
    size,
    username,
    projectName
  } = await req.json();

const supabase = await createClient();

  // 1. Get project and file info
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectName)
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: 'Project not found' }, 
      { status: 404 }
    );
  }

  // 2. Create/update file in file_tree
  const { data: file, error: fileError } = await supabase
    .from('file_tree')
    .upsert(
      {
        project_id: project.id,
        commit_id: commitId,
        path: filePath,
        name: fileName,
        type: fileType,
        content,
        size,
        extension,
      },
      { onConflict: 'path,commit_id' }
    )
    .select('id')
    .single();

  if (fileError) {
    return NextResponse.json(
      { error: fileError.message }, 
      { status: 500 }
    );
  }

  // 3. Record the change
  const { error: changeError } = await supabase
    .from('file_changes')
    .insert([
      {
        commit_id: commitId,
        file_id: file.id,
        change_type: changeType,
        new_path: filePath,
        new_content: content,
        additions: content.split('\n').length,
        deletions: 0,
      }
    ]);

  if (changeError) {
    return NextResponse.json(
      { error: changeError.message }, 
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}