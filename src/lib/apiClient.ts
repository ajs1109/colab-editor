import { AccessLevel, Repository, User } from '@/types';
import { UserPermissions } from '@/types/socket';
import { createBrowserClient } from '@supabase/ssr';
import { NextApiRequest, NextApiResponse } from 'next';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const supabase = createClient();

// Enhanced API Response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// API Response helpers with fixed return types
export class ApiResponseHelper {
  static success<T>(data: T, message?: string): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      message: message || 'Operation successful'
    };
  }

  static error(message: string, code: string = 'GENERIC_ERROR', details?: any): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      }
    };
  }

  static paginated<T>(data: T[], page: number, limit: number, total: number): ApiPaginatedResponse<T> {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

// Authentication helpers
export class AuthService {
  static async getCurrentUser(req: NextApiRequest): Promise<User | null> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  }

  static async requireAuth(req: NextApiRequest, res: NextApiResponse): Promise<User | null> {
    const user = await this.getCurrentUser(req);
    if (!user) {
      res.status(401).json(ApiResponseHelper.error('Authentication required', 'UNAUTHORIZED'));
      return null;
    }
    return user;
  }
}

// Permission helpers
export class PermissionService {
  static hasPermission(userLevel: AccessLevel, requiredLevel: AccessLevel): boolean {
    const levels = { 'read': 1, 'write': 2, 'admin': 3 };
    return levels[userLevel] >= levels[requiredLevel];
  }

  static async getUserProjectPermissions(userId: string, projectId: string): Promise<UserPermissions> {
    // Check if user is project owner
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (project?.owner_id === userId) {
      return {
        can_read: true,
        can_write: true,
        can_admin: true,
        access_level: 'admin'
      };
    }

    // Check project membership
    const { data: membership } = await supabase
      .from('project_members')
      .select('access_level')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    const accessLevel = membership?.access_level || 'read';
    
    return {
      can_read: this.hasPermission(accessLevel, 'read'),
      can_write: this.hasPermission(accessLevel, 'write'),
      can_admin: this.hasPermission(accessLevel, 'admin'),
      access_level: accessLevel
    };
  }

  static async getUserRepositoryPermissions(userId: string, repositoryId: string): Promise<UserPermissions> {
    // Check if user is repository owner
    const { data: repository } = await supabase
      .from('repositories')
      .select('owner_id, project_id, is_public')
      .eq('id', repositoryId)
      .single();

    if (!repository) {
      return { can_read: false, can_write: false, can_admin: false };
    }

    if (repository.owner_id === userId) {
      return {
        can_read: true,
        can_write: true,
        can_admin: true,
        access_level: 'admin'
      };
    }

    // Check repository membership
    const { data: repoMembership } = await supabase
      .from('repository_members')
      .select('access_level')
      .eq('repository_id', repositoryId)
      .eq('user_id', userId)
      .single();

    if (repoMembership) {
      const accessLevel = repoMembership.access_level;
      return {
        can_read: this.hasPermission(accessLevel, 'read'),
        can_write: this.hasPermission(accessLevel, 'write'),
        can_admin: this.hasPermission(accessLevel, 'admin'),
        access_level: accessLevel
      };
    }

    // Check project-level permissions
    const projectPermissions = await this.getUserProjectPermissions(userId, repository.project_id);
    
    // If repository is public, allow read access
    if (repository.is_public && !projectPermissions.can_read) {
      return { can_read: true, can_write: false, can_admin: false, access_level: 'read' };
    }

    return projectPermissions;
  }

  static async requireRepositoryAccess(
    req: NextApiRequest, 
    res: NextApiResponse, 
    repositoryId: string, 
    requiredLevel: AccessLevel = 'read'
  ): Promise<User | null> {
    const user = await AuthService.requireAuth(req, res);
    if (!user) return null;

    const permissions = await this.getUserRepositoryPermissions(user.id, repositoryId);
    
    if (!this.hasPermission(permissions.access_level || 'read', requiredLevel)) {
      res.status(403).json(ApiResponseHelper.error('Insufficient permissions', 'FORBIDDEN'));
      return null;
    }

    return user;
  }
}

// Repository service
export class RepositoryService {
  static async getRepository(id: string, userId?: string): Promise<Repository | null> {
    const { data: repository } = await supabase
      .from('repositories')
      .select(`
        *,
        owner:users(id, username, avatar_url),
        project:projects(id, name, description)
      `)
      .eq('id', id)
      .single();

    if (!repository) return null;

    // Add user permissions if userId provided
    if (userId) {
      const permissions = await PermissionService.getUserRepositoryPermissions(userId, id);
      repository.permissions = {
        read: permissions.can_read,
        write: permissions.can_write,
        admin: permissions.can_admin
      };
    }

    return repository;
  }

  static async createRepository(data: any, ownerId: string): Promise<Repository> {
    const { data: repository, error } = await supabase
      .from('repositories')
      .insert({
        ...data,
        owner_id: ownerId
      })
      .select(`
        *,
        owner:users(id, username, avatar_url),
        project:projects(id, name, description)
      `)
      .single();

    if (error) throw error;

    // Create default branch
    await supabase
      .from('branches')
      .insert({
        repository_id: repository.id,
        name: 'main',
        is_default: true
      });

    return repository;
  }

  static async getRepositoryMembers(repositoryId: string) {
    const { data } = await supabase
      .from('repository_members')
      .select(`
        *,
        user:users(id, username, avatar_url)
      `)
      .eq('repository_id', repositoryId);

    return data || [];
  }

  static async addRepositoryMember(repositoryId: string, userId: string, accessLevel: AccessLevel, addedBy: string) {
    const { data, error } = await supabase
      .from('repository_members')
      .insert({
        repository_id: repositoryId,
        user_id: userId,
        access_level: accessLevel,
        added_by: addedBy
      })
      .select(`
        *,
        user:users(id, username, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  }
}

// File system service
export class FileSystemService {
  static async getFileTree(repositoryId: string, commitId?: string): Promise<any[]> {
    let query = supabase
      .from('file_tree')
      .select('*')
      .eq('repository_id', repositoryId)
      .order('path');

    if (commitId) {
      query = query.eq('commit_id', commitId);
    }

    const { data: files } = await query;
    if (!files) return [];

    // Build hierarchical structure
    const fileMap = new Map();
    const rootFiles: any[] = [];

    // First pass: create all nodes
    files.forEach(file => {
      fileMap.set(file.id, {
        ...file,
        children: file.type === 'dir' ? [] : undefined
      });
    });

    // Second pass: build hierarchy
    files.forEach(file => {
      const node = fileMap.get(file.id);
      if (file.parent_id) {
        const parent = fileMap.get(file.parent_id);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        rootFiles.push(node);
      }
    });

    return rootFiles;
  }

  static async getFileContent(repositoryId: string, path: string, commitId?: string): Promise<any> {
    let query = supabase
      .from('file_tree')
      .select('*')
      .eq('repository_id', repositoryId)
      .eq('path', path)
      .eq('type', 'file');

    if (commitId) {
      query = query.eq('commit_id', commitId);
    }

    const { data } = await query.single();
    return data;
  }

  static async saveFile(repositoryId: string, path: string, content: string, userId: string, commitMessage: string) {
    // Create new commit
    const { data: commit } = await supabase
      .from('commits')
      .insert({
        repository_id: repositoryId,
        message: commitMessage,
        author_id: userId,
        committer_id: userId,
        sha: this.generateSHA(),
        tree_sha: this.generateSHA()
      })
      .select()
      .single();

    // Save file
    const pathParts = path.split('/');
    const fileName = pathParts.pop()!;
    const extension = fileName.includes('.') ? fileName.split('.').pop() : undefined;

    const { data: file } = await supabase
      .from('file_tree')
      .insert({
        repository_id: repositoryId,
        commit_id: commit.id,
        path,
        name: fileName,
        type: 'file',
        content,
        size: content.length,
        extension
      })
      .select()
      .single();

    // Record file change
    await supabase
      .from('file_changes')
      .insert({
        commit_id: commit.id,
        file_id: file.id,
        change_type: 'modified',
        new_content: content,
        additions: content.split('\n').length,
        deletions: 0
      });

    return { commit, file };
  }

  private static generateSHA(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Commit service
export class CommitService {
  static async getCommits(repositoryId: string, options: any = {}) {
    let query = supabase
      .from('commits')
      .select(`
        *,
        author:users!commits_author_id_fkey(id, username, avatar_url),
        committer:users!commits_committer_id_fkey(id, username, avatar_url)
      `)
      .eq('repository_id', repositoryId)
      .order('committed_at', { ascending: false });

    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 25) - 1);

    const { data } = await query;
    return data || [];
  }

  static async getCommit(repositoryId: string, sha: string) {
    const { data } = await supabase
      .from('commits')
      .select(`
        *,
        author:users!commits_author_id_fkey(id, username, avatar_url),
        committer:users!commits_committer_id_fkey(id, username, avatar_url),
        file_changes(
          *,
          file:file_tree(*)
        )
      `)
      .eq('repository_id', repositoryId)
      .eq('sha', sha)
      .single();

    return data;
  }
}

// Issue service
export class IssueService {
  static async getIssues(repositoryId: string, filters: any = {}) {
    let query = supabase
      .from('issues')
      .select(`
        *,
        author:users(id, username, avatar_url),
        assignees:issue_assignees(
          user:users(id, username, avatar_url)
        ),
        labels:issue_labels(
          label:labels(*)
        )
      `)
      .eq('repository_id', repositoryId);

    if (filters.state) query = query.eq('state', filters.state);
    if (filters.author_id) query = query.eq('author_id', filters.author_id);

    query = query.order('created_at', { ascending: false });

    const { data } = await query;
    return data || [];
  }

  static async createIssue(repositoryId: string, data: any, authorId: string) {
    const { data: issue, error } = await supabase
      .from('issues')
      .insert({
        repository_id: repositoryId,
        title: data.title,
        body: data.body,
        author_id: authorId
      })
      .select(`
        *,
        author:users(id, username, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Add assignees if provided
    if (data.assignee_ids?.length) {
      await supabase
        .from('issue_assignees')
        .insert(
          data.assignee_ids.map((userId: string) => ({
            issue_id: issue.id,
            user_id: userId
          }))
        );
    }

    // Add labels if provided
    if (data.label_ids?.length) {
      await supabase
        .from('issue_labels')
        .insert(
          data.label_ids.map((labelId: string) => ({
            issue_id: issue.id,
            label_id: labelId
          }))
        );
    }

    return issue;
  }
}

// Enhanced User Service with typed responses
export class UserService {
  static async getUserIdByName(username: string): Promise<ApiResponse<string>> {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("name", username)
      .single();
    
    if (userError || !userData) {
      return ApiResponseHelper.error("Couldn't fetch user id", userError?.code || 'USER_NOT_FOUND', userError);
    }
    
    return ApiResponseHelper.success(userData.id, "Successfully fetched user id");
  }

  static async getUserById(id: string): Promise<ApiResponse<User>> {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    
    if (userError || !userData) {
      return ApiResponseHelper.error("User not found", userError?.code || 'USER_NOT_FOUND', userError);
    }
    
    return ApiResponseHelper.success(userData, "Successfully fetched user");
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    
    if (userError || !userData) {
      return ApiResponseHelper.error("Failed to update user", userError?.code || 'UPDATE_FAILED', userError);
    }
    
    return ApiResponseHelper.success(userData, "User updated successfully");
  }
}

// Validation helpers
export class ValidationService {
  static validateRepositoryName(name: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(name) && name.length >= 1 && name.length <= 100;
  }

  static validateUsername(username: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(username) && username.length >= 3 && username.length <= 50;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}

// Rate limiting helper
export class RateLimitService {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static isRateLimited(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (userRequests.count >= maxRequests) {
      return true;
    }

    userRequests.count++;
    return false;
  }
}

// Error handling
export function handleApiError(error: any, res: NextApiResponse) {
  console.error('API Error:', error);
  
  if (error.code === '23505') { // Unique constraint violation
    return res.status(409).json(ApiResponseHelper.error('Resource already exists', 'CONFLICT'));
  }
  
  if (error.code === '23503') { // Foreign key violation
    return res.status(400).json(ApiResponseHelper.error('Referenced resource not found', 'INVALID_REFERENCE'));
  }
  
  return res.status(500).json(ApiResponseHelper.error('Internal server error', 'INTERNAL_ERROR'));
}

// Type guard utilities for better type safety
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.success === false;
}