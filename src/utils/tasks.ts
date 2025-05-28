import { DateUpdates } from '@/hooks/useTaskQueries';
import { createClient } from './supabase/client';

const supabase = createClient();

export const tasks = {
  // Board-related operations
  board: {
    getProjectTasks: async (projectId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          id,
          title,
          status_id,
          statusPosition,
          creator:created_by ( id, name, avatar ),
          size ( id, label, color ),
          priority ( id, label, color, order ),
          task_labels (
            labels ( id, label, color )
          ),
          task_assignees (
            users ( id, name, avatar, description, links )
          )
        `
        )
        .eq('project_id', projectId);

      if (error) throw error;

      return data.map((task) => ({
        ...task,
        labels: task.task_labels?.map((tl) => tl.labels) || [],
        assignees: task.task_assignees?.map((a) => a.users) || [],
        task_labels: null,
        task_assignees: null,
      })) as any[];
    },

    updatePosition: async (taskId: string, statusPosition: number) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          statusPosition,
          updated_at: new Date(),
        })
        .eq('id', taskId)
        .select('*')
        .single();

      if (error) throw error;
      return data as ITask;
    },

    moveTask: async (
      taskId: string,
      statusId: string,
      statusPosition: number
    ) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status_id: statusId,
          statusPosition,
          updated_at: new Date(),
        })
        .eq('id', taskId)
        .select('*')
        .single();

      if (error) throw error;
      return data as ITask;
    },
  },

  // Task details operations
  details: {
    get: async (taskId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
          creator:created_by ( id, name, avatar, description, links ),
          size ( id, label, color ),
          priority ( id, label, color, order ),
          task_labels (
            labels ( id, label, color )
          ),
          task_assignees (
            users ( id, name, description, avatar, links )
          )
        `
        )
        .eq('id', taskId)
        .single();

      if (error) throw error;

      return {
        ...data,
        labels: data.task_labels?.map((tl: any) => tl.labels) || [],
        assignees: data.task_assignees?.map((a: any) => a.users) || [],
        task_labels: null,
        task_assignees: null,
      } as ITaskWithOptions;
    },

    update: async (taskId: string, updates: Partial<ITask>) => {
      // Handle task_labels junction table
      if ('labels' in updates) {
        const labelIds = updates.labels || [];
        delete updates.labels; // Remove from main task update

        // First delete existing task-label relationships
        await supabase.from('task_labels').delete().eq('task_id', taskId);

        // Then insert new ones if any
        if (labelIds.length > 0) {
          await supabase.from('task_labels').insert(
            labelIds.map((labelId) => ({
              task_id: taskId,
              label_id: labelId,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          );
        }
      }

      // Handle task_assignees junction table (existing code)
      if ('assignees' in updates) {
        // Get the array of assignee IDs, or empty array if none provided
        const assigneeIds = updates.assignees || [];
        // Remove assignees from updates object since we handle it separately
        delete updates.assignees;

        // Delete all existing task-assignee relationships for this task
        await supabase.from('task_assignees').delete().eq('task_id', taskId);

        // If there are new assignees to add
        if (assigneeIds.length > 0) {
          // Insert new task-assignee relationships
          await supabase.from('task_assignees').insert(
            // Map each assignee ID to a task-assignee relationship object
            assigneeIds.map((userId) => ({
              task_id: taskId, // The task being updated
              user_id: userId, // The user being assigned
              created_at: new Date(), // When this assignment was created
              updated_at: new Date(), // When this assignment was last updated
            }))
          );
        }
      }

      // Update main task if there are any direct table updates
      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase
          .from('tasks')
          .update({ ...updates, updated_at: new Date() })
          .eq('id', taskId)
          .select('*')
          .single();

        if (error) throw error;
        return data as ITask;
      }

      return null;
    },

    delete: async (taskId: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    },

    updateDates: async (taskId: string, dates: DateUpdates) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          startDate: dates.startDate,
          endDate: dates.endDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select('*')
        .single();

      if (error) throw error;
      return data as ITask;
    },
  },

  // Task creation
  create: async (task: Partial<ITask>) => {
    const { data: createdTask, error } = await supabase
      .from('tasks')
      .insert(task)
      .select(
        `
        *,
        creator:created_by (
          id,
          name,
          avatar
        )
      `
      )
      .single();

    if (error) throw error;
    return createdTask as ITaskWithOptions;
  },
};
