export const placeholderUserImageUrl = 'https://github.com/shadcn.png';

export enum SelectedCustomField {
  TasksByStatus = 'status,none',
  TasksByLabel = 'label,none',
  TasksBySize = 'size,none',
  TasksByPriority = 'priority,none',

  TasksByStatusGroupedByLabel = 'status,label',
  TasksByStatusGroupedBySize = 'status,size',
  TasksByStatusGroupedByPriority = 'status,priority',

  TasksByLabelGroupedByStatus = 'label,status',
  TasksByLabelGroupedBySize = 'label,size',
  TasksByLabelGroupedByPriority = 'label,priority',

  TasksBySizeGroupedByStatus = 'size,status',
  TasksBySizeGroupedByLabel = 'size,label',
  TasksBySizeGroupedByPriority = 'size,priority',

  TasksByPriorityGroupedByStatus = 'priority,status',
  TasksByPriorityGroupedByLabel = 'priority,label',
  TasksByPriorityGroupedBySize = 'priority,size',
}

export enum ProjectAction {
  UPDATE_PROJECT = 'update_project',
  DELETE_PROJECT = 'delete_project',
  CLOSE_PROJECT = 'close_project',
  VIEW_SETTINGS = 'view_settings',
  VIEW_OPTIONS = 'view_options',
  CREATE_OPTIONS = 'create_options',
  UPDATE_OPTIONS = 'update_options',
  DELETE_OPTIONS = 'delete_options',
  VIEW_MEMBERS = 'view_members',
  INVITE_MEMBERS = 'invite_members',
  UPDATE_MEMBER_ROLE = 'update_member_role',
  REMOVE_MEMBERS = 'remove_members',
  VIEW_TASKS = 'view_tasks',
  MOVE_TASKS = 'move_tasks',
  CREATE_TASKS = 'create_tasks',
  UPDATE_TASKS = 'update_tasks',
  DELETE_TASKS = 'delete_tasks',
}
