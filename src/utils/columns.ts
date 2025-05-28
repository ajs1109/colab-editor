import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const columns = {
  async updateLimit(columnId: string, limit: number) {
    const { data, error } = await supabase
      .from('statuses')
      .update({ limit })
      .eq('id', columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDetails(columnId: string, updates: Partial<ICustomFieldData>) {
    const { data, error } = await supabase
      .from('statuses')
      .update(updates)
      .eq('id', columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteColumn(columnId: string) {
    const { error } = await supabase
      .from('statuses')
      .delete()
      .eq('id', columnId);

    if (error) throw error;
  },

  async createColumn(projectId: string, data: Omit<ICustomFieldData, 'id'>) {
    const { data: column, error } = await supabase
      .from('statuses')
      .insert({
        ...data,
        project_id: projectId,
        limit: 5,
        order: await this.getNextOrder(projectId),
      })
      .select()
      .single();

    if (error) throw error;
    return column;
  },

  async getNextOrder(projectId: string) {
    const { data, error } = await supabase
      .from('statuses')
      .select('order')
      .eq('project_id', projectId)
      .order('order', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return (data?.order ?? -1) + 1;
  },
};
