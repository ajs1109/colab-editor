export interface User {
  id: string;
  username: string;
  avatar_url: string;
  name: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
  default_branch: string;
}

export interface Branch {
  name: string;
  commit: Commit;
  protected: boolean;
}

export interface Commit {
  id: string;
  message: string;
  author: User;
  committer: User;
  date: string;
  tree_sha: string;
}

export interface File {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha: string;
  content?: string;
}

export interface Issue {
  id: string;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  author: User;
  assignees: User[];
  labels: Label[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface PullRequest {
  id: string;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  author: User;
  assignees: User[];
  labels: Label[];
  base_branch: string;
  head_branch: string;
}