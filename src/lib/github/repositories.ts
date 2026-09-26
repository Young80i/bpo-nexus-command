/**
 * GitHub Data Repositories
 * Repository pattern implementation for GitHub entities
 */

import { 
  getRepository, 
  getBranches, 
  getCommits, 
  getPullRequests, 
  getIssues, 
  getReleases, 
  getContributors,
  getRecentCommits,
  getDefaultBranch
} from './client';
import type { 
  GitHubRepository, 
  GitHubBranch, 
  GitHubCommit, 
  GitHubPullRequest, 
  GitHubIssue, 
  GitHubRelease, 
  GitHubContributor 
} from './types';

// Repository for GitHub Repository entity
export const githubRepositoryRepository = {
  /**
   * Get repository information
   */
  getRepository: async (owner: string, repo: string, token?: string): Promise<GitHubRepository> => {
    return await getRepository(owner, repo, token);
  },
  
  /**
   * Get repository metadata
   */
  getMetadata: async (owner: string, repo: string, token?: string) => {
    const repository = await getRepository(owner, repo, token);
    
    return {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      language: repository.language,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      openIssues: repository.open_issues_count,
      createdAt: repository.created_at,
      updatedAt: repository.updated_at,
      pushedAt: repository.pushed_at,
      defaultBranch: repository.default_branch,
      topics: repository.topics,
      size: repository.size,
      archived: repository.archived
    };
  }
};

// Repository for GitHub Branches
export const githubBranchRepository = {
  /**
   * Get all branches
   */
  getAll: async (owner: string, repo: string, token?: string): Promise<GitHubBranch[]> => {
    return await getBranches(owner, repo, token);
  },
  
  /**
   * Get default branch
   */
  getDefault: async (owner: string, repo: string, token?: string): Promise<GitHubBranch> => {
    return await getDefaultBranch(owner, repo, token);
  }
};

// Repository for GitHub Commits
export const githubCommitRepository = {
  /**
   * Get commits
   */
  getAll: async (owner: string, repo: string, token?: string, options?: { 
    sha?: string; 
    path?: string; 
    author?: string; 
    since?: string; 
    until?: string; 
    per_page?: number 
  }): Promise<GitHubCommit[]> => {
    return await getCommits(owner, repo, token, options);
  },
  
  /**
   * Get recent commits (last week)
   */
  getRecent: async (owner: string, repo: string, token?: string): Promise<GitHubCommit[]> => {
    return await getRecentCommits(owner, repo, token);
  }
};

// Repository for GitHub Pull Requests
export const githubPullRequestRepository = {
  /**
   * Get pull requests
   */
  getAll: async (owner: string, repo: string, token?: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPullRequest[]> => {
    return await getPullRequests(owner, repo, token, state);
  },
  
  /**
   * Get open pull requests
   */
  getOpen: async (owner: string, repo: string, token?: string): Promise<GitHubPullRequest[]> => {
    return await getPullRequests(owner, repo, token, 'open');
  }
};

// Repository for GitHub Issues
export const githubIssueRepository = {
  /**
   * Get issues
   */
  getAll: async (owner: string, repo: string, token?: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> => {
    return await getIssues(owner, repo, token, state);
  },
  
  /**
   * Get open issues
   */
  getOpen: async (owner: string, repo: string, token?: string): Promise<GitHubIssue[]> => {
    return await getIssues(owner, repo, token, 'open');
  }
};

// Repository for GitHub Releases
export const githubReleaseRepository = {
  /**
   * Get releases
   */
  getAll: async (owner: string, repo: string, token?: string): Promise<GitHubRelease[]> => {
    return await getReleases(owner, repo, token);
  }
};

// Repository for GitHub Contributors
export const githubContributorRepository = {
  /**
   * Get contributors
   */
  getAll: async (owner: string, repo: string, token?: string): Promise<GitHubContributor[]> => {
    return await getContributors(owner, repo, token);
  }
};