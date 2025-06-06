// This file exports TypeScript types and interfaces used throughout the application.
export type AccessLevel = 'read' | 'write' | 'admin';
export type IssueState = 'open' | 'closed';
export type FileType = 'file' | 'dir';
export type ChangeType = 'added' | 'modified' | 'deleted' | 'renamed';
export type OperationType = 'insert' | 'delete' | 'retain';
export type AuthProvider = 'google' | 'github' | 'email';

export interface Repository {
  id: string;
  name: string;
  description?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  language?: string;
  is_public: boolean;
  members?: RepositoryMember[];
}

export interface RepositoryMember {
  id: string;
  repository_id: string;
  user_id: string;
  user?: IUser;
  access_level: AccessLevel;
  added_by: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  description: string;
  avatarUrl: string;
  created_at: Date;
  updated_at: Date;
  links: UserLink[];
  provider: AuthProvider;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  user?: IUser;
  access_level: AccessLevel;
  added_by: string;
  created_at: string;
}
// Update the Commit interface to include file_changes
export interface Commit {
  id: string;
  project_id: string;
  message: string;
  committer_id: string;
  parent_commit_id?: string;
  committed_at: string;
  created_at: string;
  updated_at: string;
  committer?: IUser;
  file_changes?: FileChange[];
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface FileTreeNode {
  id: string;
  repository_id: string;
  commit_id: string;
  path: string;
  name: string;
  type: FileType;
  parent_id?: string;
  content?: string;
  size: number;
  extension?: string;
  mime_type?: string;
  encoding: string;
  created_at: string;
  children?: FileTreeNode[];
  is_directory: boolean;
}
export interface FileChange {
  id: string;
  commit_id: string;
  file_id: string;
  change_type: 'added' | 'modified' | 'deleted' | 'renamed';
  old_path?: string;
  new_path?: string;
  old_content?: string;
  new_content?: string;
  additions?: number;
  deletions?: number;
  created_at: string;
  file?: {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'dir';
    extension?: string;
  };
}

