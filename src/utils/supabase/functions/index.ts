import { NextResponse } from "next/server";
import { createClient } from "../server";
import { ApiResponse, ApiResponseHelper, isApiError } from "@/lib/apiClient";

export async function getUserByName(username: string): Promise<ApiResponse<IUser>> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("name", username)
    .single();

  if (userError || !userData) {
    return ApiResponseHelper.error("Couldn't fetch user", userError?.code, userError);
  }
  return ApiResponseHelper.success(userData, "Successfully fetched user");
}

export async function getUserIdByName(username: string): Promise<ApiResponse<string>> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("name", username)
    .single();

  if (userError || !userData) {
    return ApiResponseHelper.error(
      "Couldn't fetch user id",
      userError?.code,
      userError
    );
  }
  return ApiResponseHelper.success(userData.id, "Successfully fetched user id");
}


export async function getProjectIdByUsernameAndRepoName(username: string, repo: string): Promise<ApiResponse<string>> {
  const supabase = await createClient();

  const userResponse = await getUserIdByName(username);
    if(isApiError(userResponse)) return ApiResponseHelper.error(userResponse.error.message, userResponse.error.code, userResponse.error.details);
    
    const userId = userResponse.data;

  const { data: projectData, error: userError } = await supabase
    .from("projects")
    .select("id")
    .eq("name", repo)
    .eq("created_by", userId)
    .single();

  if (userError || !projectData) {
    return ApiResponseHelper.error(
      "Couldn't fetch project id",
      userError?.code,
      userError
    );
  }
  return ApiResponseHelper.success(projectData.id, "Successfully fetched project id");
}