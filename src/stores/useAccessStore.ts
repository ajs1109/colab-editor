import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { ProjectAction } from '@/consts';

interface AccessState {
  permissions: Record<string, Record<ProjectAction, boolean>>;
  roles: Record<string, Role>;
  isCreator: Record<string, boolean>;
  setProjectAccess: (
    projectId: string,
    access: {
      permissions: Record<ProjectAction, boolean>;
      role: Role;
      isCreator: boolean;
    }
  ) => void;
  fetchProjectAccess: (projectId: string) => Promise<void>;
  reset: () => void;
  requiresMinRole: (projectId: string, minRole: Role) => boolean;
}

const supabase = createClient();

export const useAccessStore = create<AccessState>((set, get) => ({
  permissions: {},
  roles: {},
  isCreator: {},

  setProjectAccess: (projectId, { permissions, role, isCreator }) =>
    set((state) => ({
      permissions: { ...state.permissions, [projectId]: permissions },
      roles: { ...state.roles, [projectId]: role },
      isCreator: { ...state.isCreator, [projectId]: isCreator },
    })),

  fetchProjectAccess: async (projectId) => {
    if (!projectId) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    // Get project details
    const { data: project } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .maybeSingle();

    // Get member role
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (memberError) {
      console.error('Error fetching member role:', memberError);
    }

    const isCreator = project?.created_by === session.user.id;
    const role = isCreator ? 'owner' : member?.role || 'read';

    // Define permissions based on role
    const permissions = calculatePermissions(role);

    get().setProjectAccess(projectId, { permissions, role, isCreator });
  },

  reset: () => set({ permissions: {}, roles: {}, isCreator: {} }),

  requiresMinRole: (projectId: string, minRole: Role): boolean => {
    const roleHierarchy: Record<Role, number> = {
      owner: 3,
      admin: 2,
      write: 1,
      read: 0,
    };

    const userRole = get().roles[projectId];
    if (!userRole) return false;

    return roleHierarchy[userRole] >= roleHierarchy[minRole];
  },
}));

function calculatePermissions(role: Role): Record<ProjectAction, boolean> {
  const manageProject: ProjectAction[] = [
    ProjectAction.UPDATE_PROJECT,
    ProjectAction.DELETE_PROJECT,
    ProjectAction.CLOSE_PROJECT,
  ];
  const manageSettings: ProjectAction[] = [
    ProjectAction.VIEW_SETTINGS,
    ProjectAction.VIEW_OPTIONS,
    ProjectAction.CREATE_OPTIONS,
    ProjectAction.UPDATE_OPTIONS,
    ProjectAction.DELETE_OPTIONS,
  ];
  const manageMembers: ProjectAction[] = [
    ProjectAction.VIEW_MEMBERS,
    ProjectAction.INVITE_MEMBERS,
    ProjectAction.UPDATE_MEMBER_ROLE,
    ProjectAction.REMOVE_MEMBERS,
  ];
  const manageTasks: ProjectAction[] = [
    ProjectAction.VIEW_TASKS,
    ProjectAction.MOVE_TASKS,
    ProjectAction.CREATE_TASKS,
    ProjectAction.UPDATE_TASKS,
    ProjectAction.DELETE_TASKS,
  ];

  const permissions: Record<Role, ProjectAction[]> = {
    owner: [
      ...manageProject,
      ...manageSettings,
      ...manageMembers,
      ...manageTasks,
    ],
    admin: [
      ProjectAction.CLOSE_PROJECT,
      ProjectAction.UPDATE_PROJECT,
      ...manageSettings,
      ...manageMembers,
      ...manageTasks,
    ],
    write: [
      ProjectAction.VIEW_SETTINGS,
      ProjectAction.VIEW_OPTIONS,
      ProjectAction.CREATE_OPTIONS,
      ProjectAction.UPDATE_OPTIONS,
      ProjectAction.VIEW_MEMBERS,
      ...manageTasks,
    ],
    read: [
      ProjectAction.VIEW_OPTIONS,
      ProjectAction.VIEW_MEMBERS,
      ProjectAction.VIEW_TASKS,
      ProjectAction.MOVE_TASKS,
    ],
  };

  const allowedActions = permissions[role];
  return Object.values(ProjectAction).reduce(
    (acc, action) => ({
      ...acc,
      [action]: allowedActions.includes(action),
    }),
    {} as Record<ProjectAction, boolean>
  );
}
