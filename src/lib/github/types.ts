/**
 * GitHub Integration Types
 */

// GitHub Repository
export type GitHubRepository = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  default_branch: string;
  topics: string[];
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  open_issues_count: number;
  archived: boolean;
  disabled: boolean;
};

// GitHub User/Organization
export type GitHubUser = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: 'User' | 'Organization';
  site_admin: boolean;
};

// GitHub Branch
export type GitHubBranch = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
};

// GitHub Commit
export type GitHubCommit = {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
};

// GitHub Pull Request
export type GitHubPullRequest = {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  number: number;
  state: 'open' | 'closed';
  locked: boolean;
  title: string;
  user: GitHubUser;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: any[];
  labels: Array<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string | null;
  }>;
  draft: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
};

// GitHub Issue
export type GitHubIssue = {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  state: 'open' | 'closed';
  locked: boolean;
  title: string;
  user: GitHubUser;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author_association: string;
  labels: Array<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string | null;
  }>;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
};

// GitHub Release
export type GitHubRelease = {
  id: number;
  node_id: string;
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  tag_name: string;
  target_commitish: string;
  name: string | null;
  draft: boolean;
  author: GitHubUser;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  assets: any[];
  body: string | null;
};

// GitHub Contributor
export type GitHubContributor = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: 'User' | 'Organization';
  site_admin: boolean;
  contributions: number;
};

// GitHub Activity Metrics
export type GitHubActivityMetrics = {
  commitsThisWeek: number;
  openPRs: number;
  openIssues: number;
  releases: number;
  contributors: number;
  repositoryHealth: number; // 0-100 score
  lastCommitDate: string | null;
  defaultBranch: string;
  lastDeploymentCommit: string | null;
};

// GitHub Repository Metadata
export type GitHubRepositoryMetadata = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  topics: string[];
  size: number;
  archived: boolean;
};