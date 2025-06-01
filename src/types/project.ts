export interface User {
  id: string;
  username: string;
  avatar_url: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  members: User[];
  permissions?: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
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

export interface File {
  id: string;
  path: string;
  name: string;
  type: 'file' | 'dir';
  content?: string;
  size?: number;
  extension?: string;
  is_directory: boolean;
}