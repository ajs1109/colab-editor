// This file exports TypeScript types and interfaces used throughout the application.

export interface IRepository {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  stars: number;
  forks: number;
  issuesCount: number;
  pullRequestsCount: number;
}

export interface IUser {
  id: string;
  email: string;
  description: string;
  avatarUrl: string;
  created_at: Date;
  updated_at: Date;
  links: IUserLink[];
  provider: 'google' | 'github' | 'email';
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}