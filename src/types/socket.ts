// types/socket.ts
import { NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { AccessLevel, AuthProvider, ChangeType, OperationType } from '.';
import { Repository, User } from './project';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: Server;
    } & Partial<Server>;
  };
};
export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface SelectionRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface UserPresence {
  id: string;
  name: string;
  color: string;
  position: CursorPosition;
  selection?: SelectionRange;
}

export interface FileEditEvent {
  userId: string;
  filePath: string;
  changes: EditChange[];
}

export interface EditChange {
  range: SelectionRange;
  text: string;
  timestamp: number;
}

// Real-time collaboration types
export interface CollaborationSession {
  id: string;
  repository_id: string;
  file_path: string;
  host_user_id: string;
  host_user?: IUser;
  is_active: boolean;
  created_at: string;
  ended_at?: string;
  participants?: SessionParticipant[];
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  user?: IUser;
  joined_at: string;
  left_at?: string;
  cursor_position: number;
  selection_start: number;
  selection_end: number;
  is_active: boolean;
}

export interface EditOperation {
  id: string;
  session_id: string;
  user_id: string;
  user?: IUser;
  operation_type: OperationType;
  position: number;
  content?: string;
  length: number;
  revision: number;
  applied_at: string;
}

// Socket.IO event types
export interface SocketEvents {
  // Client to server
  'join-session': (sessionId: string) => void;
  'leave-session': (sessionId: string) => void;
  'operation': (operation: EditOperation) => void;
  'cursor-update': (cursor: CursorUpdate) => void;
  
  // Server to client
  'operation-received': (operation: EditOperation) => void;
  'cursor-update-received': (cursor: CursorUpdate) => void;
  'participant-joined': (participant: SessionParticipant) => void;
  'participant-left': (participant: SessionParticipant) => void;
  'session-ended': () => void;
}

export interface CursorUpdate {
  session_id: string;
  user_id: string;
  position: number;
  selection_start: number;
  selection_end: number;
}

// Form types for API requests
export interface CreateProjectRequest {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface CreateRepositoryRequest {
  name: string;
  description?: string;
  project_id: string;
  is_public?: boolean;
  language?: string;
}

export interface UpdateRepositoryRequest {
  name?: string;
  description?: string;
  is_public?: boolean;
  language?: string;
  default_branch?: string;
}

export interface AddMemberRequest {
  user_id: string;
  access_level: AccessLevel;
}

export interface UpdateMemberRequest {
  access_level: AccessLevel;
}

export interface CreateBranchRequest {
  name: string;
  from_branch?: string;
  from_commit?: string;
}

export interface CreateCommitRequest {
  message: string;
  branch_name: string;
  file_changes: {
    path: string;
    content: string;
    change_type: ChangeType;
  }[];
}

export interface CreateIssueRequest {
  title: string;
  body?: string;
  assignee_ids?: string[];
  label_ids?: string[];
}

export interface CreateLabelRequest {
  name: string;
  color: string;
  description?: string;
}

export interface FileUpdateRequest {
  content: string;
  commit_message: string;
  branch_name?: string;
}

export interface StartCollaborationRequest {
  repository_id: string;
  file_path: string;
}

// Database utility types
export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  description?: string;
  provider: AuthProvider;
  created_at: string;
  updated_at: string;
}

export interface DatabaseRepository {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  owner_id: string;
  is_public: boolean;
  language?: string;
  stars: number;
  forks: number;
  issues_count: number;
  pull_requests_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
}

// Query options
export interface RepositoryQueryOptions {
  include_members?: boolean;
  include_branches?: boolean;
  include_owner?: boolean;
  include_project?: boolean;
}

export interface CommitQueryOptions {
  include_author?: boolean;
  include_committer?: boolean;
  include_file_changes?: boolean;
  limit?: number;
  offset?: number;
  branch?: string;
}

export interface FileTreeQueryOptions {
  commit_id?: string;
  branch?: string;
  path?: string;
  include_content?: boolean;
  max_depth?: number;
}

// Permission helper types
export interface UserPermissions {
  can_read: boolean;
  can_write: boolean;
  can_admin: boolean;
  access_level?: AccessLevel;
}

export interface RepositoryPermissions extends UserPermissions {
  can_create_branches: boolean;
  can_push: boolean;
  can_delete: boolean;
  can_manage_members: boolean;
  can_manage_settings: boolean;
}

// Search and filter types
export interface RepositoryFilters {
  owner_id?: string;
  project_id?: string;
  is_public?: boolean;
  language?: string;
  search?: string;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'stars';
  sort_order?: 'asc' | 'desc';
}

export interface CommitFilters {
  author_id?: string;
  branch?: string;
  since?: string;
  until?: string;
  search?: string;
}

// Analytics types
export interface RepositoryStats {
  total_commits: number;
  total_contributors: number;
  total_files: number;
  total_lines: number;
  language_breakdown: Record<string, number>;
  commit_activity: {
    date: string;
    commits: number;
  }[];
  contributor_activity: {
    user_id: string;
    username: string;
    commits: number;
    additions: number;
    deletions: number;
  }[];
}

export interface ProjectStats {
  total_repositories: number;
  total_members: number;
  total_commits: number;
  total_issues: number;
  language_breakdown: Record<string, number>;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'commit' | 'issue' | 'member_added' | 'repository_created';
  user_id: string;
  user?: User;
  repository_id?: string;
  repository?: Repository;
  description: string;
  created_at: string;
}

// WebSocket real-time types
export interface RealtimePayload<T = any> {
  event: string;
  data: T;
  timestamp: string;
  user_id?: string;
}

export interface EditorState {
  content: string;
  cursor_position: number;
  selection: {
    start: number;
    end: number;
  };
  revision: number;
}

export interface CollaboratorCursor {
  user_id: string;
  username: string;
  avatar_url?: string;
  position: number;
  selection: {
    start: number;
    end: number;
  };
  color: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Configuration types
export interface RepositoryConfig {
  allow_merge_commits: boolean;
  allow_squash_merge: boolean;
  allow_rebase_merge: boolean;
  delete_branch_on_merge: boolean;
  require_status_checks: boolean;
  require_branches_up_to_date: boolean;
  restrict_pushes: boolean;
}

export interface BranchProtectionRule {
  branch_name: string;
  require_pull_request: boolean;
  required_reviewers: number;
  dismiss_stale_reviews: boolean;
  require_code_owner_reviews: boolean;
  restrict_pushes: boolean;
  allowed_users: string[];
  allowed_teams: string[];
}

// Legacy compatibility (matching your original interfaces)
export interface IRepository extends Repository {}
export interface IUser extends User {}