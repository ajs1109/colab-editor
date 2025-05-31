import { User, Repository, Branch, Commit, File, Issue, Label, PullRequest } from '@/types/project';

export const sampleUser: User = {
  id: 'user1',
  username: 'octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
  name: 'The Octocat',
};

export const sampleRepo: Repository = {
  id: 'repo1',
  name: 'Hello-World',
  description: 'My first repository',
  is_public: true,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2023-05-15T00:00:00Z',
  owner_id: 'user1',
  default_branch: 'main',
};

export const sampleBranches: Branch[] = [
  {
    name: 'main',
    commit: {
      id: 'commit1',
      message: 'Initial commit',
      author: sampleUser,
      committer: sampleUser,
      date: '2020-01-01T00:00:00Z',
      tree_sha: 'tree1',
    },
    protected: false,
  },
  {
    name: 'develop',
    commit: {
      id: 'commit2',
      message: 'Add new feature',
      author: sampleUser,
      committer: sampleUser,
      date: '2023-01-15T00:00:00Z',
      tree_sha: 'tree2',
    },
    protected: true,
  },
];

export const sampleFiles: File[] = [
  {
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    size: 1024,
    sha: 'sha1',
    content: '# Hello World\n\nThis is my first repository!',
  },
  {
    name: 'src',
    path: 'src',
    type: 'dir',
    sha: 'sha2',
  },
  {
    name: 'index.js',
    path: 'src/index.js',
    type: 'file',
    size: 512,
    sha: 'sha3',
    content: 'console.log("Hello World!");',
  },
  {
    name: 'styles.css',
    path: 'src/styles.css',
    type: 'file',
    size: 768,
    sha: 'sha4',
    content: 'body { margin: 0; padding: 0; }',
  },
];

export const sampleCommits: Commit[] = [
  {
    id: 'commit1',
    message: 'Initial commit',
    author: sampleUser,
    committer: sampleUser,
    date: '2020-01-01T00:00:00Z',
    tree_sha: 'tree1',
  },
  {
    id: 'commit2',
    message: 'Add index.js',
    author: sampleUser,
    committer: sampleUser,
    date: '2020-01-02T00:00:00Z',
    tree_sha: 'tree2',
  },
  {
    id: 'commit3',
    message: 'Add styles.css',
    author: sampleUser,
    committer: sampleUser,
    date: '2020-01-03T00:00:00Z',
    tree_sha: 'tree3',
  },
];

export const sampleLabels: Label[] = [
  {
    id: 'label1',
    name: 'bug',
    color: 'd73a4a',
    description: 'Something isn\'t working',
  },
  {
    id: 'label2',
    name: 'enhancement',
    color: 'a2eeef',
    description: 'New feature or request',
  },
];

export const sampleIssues: Issue[] = [
  {
    id: 'issue1',
    title: 'Fix styling issues',
    body: 'The styles are not being applied correctly',
    state: 'open',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    author: sampleUser,
    assignees: [sampleUser],
    labels: [sampleLabels[0]],
  },
];

export const samplePullRequests: PullRequest[] = [
  {
    id: 'pr1',
    title: 'Add new feature',
    body: 'This PR adds a new awesome feature',
    state: 'open',
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-02-02T00:00:00Z',
    author: sampleUser,
    assignees: [sampleUser],
    labels: [sampleLabels[1]],
    base_branch: 'main',
    head_branch: 'feature/new-stuff',
  },
];