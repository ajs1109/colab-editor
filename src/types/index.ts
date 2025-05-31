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

export interface IIssue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignee: string | null;
}

export interface IPullRequest {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'merged' | 'closed';
  createdAt: string;
  updatedAt: string;
  author: string;
  reviewers: string[];
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
}

export interface IProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWikiPage {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}