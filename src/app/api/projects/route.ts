import { supabase } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";


export const GET = async(request: NextRequest) => {
     try {
      const { data, error } = await supabase.rpc('get_project_files_at_commit', {
        target_commit_id: 'e5238155-1f18-4938-bff3-f301204bc8d2',
        target_project_id: 'a6d0e612-c61b-40c4-b4dd-d091d5850fb6'
      })

      if (error) throw error
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error getting project files:', error)
      throw new Error('Failed to fetch project files')
    }
} 