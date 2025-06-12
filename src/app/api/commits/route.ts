// app/api/commits/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  let { projectName, message, committerId, username }: {projectName: string, message: string, committerId: string, username: string} = await req.json();

    if(committerId == null || committerId.trim().length == 0){
        const loggedInUser = await supabase.auth.getSession();
        if(loggedInUser.data.session?.user.id){
            committerId = loggedInUser.data.session.user.id;
        }
    }

  const { data: ownerData, error: ownerError } = await supabase
    .from("users")
    .select("id")
    .eq("name", username)
    .single();

  if (ownerError || !ownerData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 1. Get project ID
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("name", projectName)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // 2. Create commit
  const { data, error } = await supabase
    .from("commits")
    .insert([
      {
        project_id: project.id,
        message,
        committer_id: committerId,
      },
    ])
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ commitId: data.id });
}
