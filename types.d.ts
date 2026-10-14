type Role = 'read' | 'write' | 'admin' | 'owner';

interface UserLink {
  id: string;
  label: string;
  url: string;
}

type IUserLink = UserLink;

interface IUser {
  id: string;
  email: string;
  name: string;
  description: string;
  avatar: string;
  created_at: Date;
  updated_at: Date;
  links: UserLink[];
  provider: 'google' | 'github' | 'email';
}

interface IProject {
  id: string;
  name: string;
  description: string;
  readme: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  closed: boolean;
}

type ProjectWithOptions = {
  name: string;
  description: string;
  readme: string;
  is_public: boolean;
};
