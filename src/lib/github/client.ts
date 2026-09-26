/**
 * GitHub API Client
 * Uses Octokit for GitHub API interactions
 */

import { Octokit } from '@octokit/rest';
import type { 
  GitHubRepository, 
  GitHubBranch, 
  GitHubCommit, 
  GitHubPullRequest, 
  GitHubIssue, 
  GitHubRelease, 
  GitHubContributor 
} from './types';

// Create Octokit instance with authentication
const createGitHubClient = (token?: string) => {
  return new Octokit({
    auth: token,
    userAgent: 'BPO Nexus JARVIS'
  });
};

// Default client without authentication for public repositories
const defaultClient = createGitHubClient();

/**
 * Fetch repository information
 */
export async function getRepository(owner: string, repo: string, token?: string): Promise<GitHubRepository> {
  const client = token ? createGitHubClient(token) : defaultClient;
  
  try {
    const { data } = await client.repos.get({
      owner,
      repo
    });
    
    return data as unknown as GitHubRepository;
  } catch (error) {
    console.error(`Error fetching repository ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Fetch repository branches
 */
export async function getBranches(owner: string, repo: string, token?: string): Promise<GitHubBranch[]> {
  const client = token ? createGitHubClient(token) : defaultClient;
  
  try {
    const { data } = await client.repos.listBranches({
      owner,
      repo,
      per_page: 100 // Limit to 100 branches
    });
    
    return data as unknown as GitHubBranch[];
  } catch (error) {
    console.error(`Error fetching branches for ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Fetch repository commits
 */
export async function getCommits(owner: string, repo: string, token?: string, options?: { 
  sha?: string; 
  path?: string; 
  author?: string; 
  since?: string; 
  until?: string; 
  per_page?: number 
}): Promise<GitHubCommit[]> {
  const client = token ? createGitHubClient(token) : defaultClient;
  
  try {
    const { data } = await client.repos.listCommits({
      owner,
      repo,
      sha: options?.sha,
      path: options?.path,
      author: options?.author,
      since: options?.since,
      until: options?.until,
      per_page: options?.per_page || 30
    });
    
    return data as unknown as GitHubCommit[];
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Fetch repository pull requests
 */
export async function getPullRequests(owner: string, repo: string, token?: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPullRequest[]> {
  const client = token ? createGitHubClient(token) : defaultClient;
  
  try {
    const { data } = await client.pulls.list({
      owner,
      repo,
      state,
      per_page: 100 // Limit to 100 PRs
    });
    
    return data as unknown as GitHubPullRequest[];
  } catch (error) {
    console.error(`Error fetching pull requests for ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Fetch repository issues
 */
export async function getIssues(owner: string, repo: string, token?: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
  const client = token ? createGitHubClient(token) : defaultClient;
  
  try {
    const { data } = await client.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 100 // Limit to 100 issues
    });
    
    return data as unknown as GitHubIssue[];
  } catch (error) {
    console.error(`Error fetching issues for ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Fetch repository releases
 */
export async function getReleases(owner: string, repo: string, token?: string): Promise<GitHubRelease[]> {
  const client = token ? createGitHubClient(token) : defaultClient;
  
  try {
    const { data } = await client.repos.listReleases({
      owner,
      repo,
      per_page: 100 // Limit to 100 releases
    });
    
    return data as unknown as GitHubRelease[];
  } catch (error) {
    console.error(`Error fetching releases for ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Fetch repository contributors
 */
export async function getContributors(owner: string, repo: string, token?: string): Promise<GitHubContributor[]> {
  const client = token ? createGitHubClient(token) : defaultClient;
  
  try {
    const { data } = await client.repos.listContributors({
      owner,
      repo,
      per_page: 100 // Limit to 100 contributors
    });
    
    return data as unknown as GitHubContributor[];
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Fetch recent commits (last week)
 */
export async function getRecentCommits(owner: string, repo: string, token?: string): Promise<GitHubCommit[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return getCommits(owner, repo, token, {
    since: oneWeekAgo.toISOString(),
    per_page: 50
  });
}

/**
 * Fetch default branch
 */
export async function getDefaultBranch(owner: string, repo: string, token?: string): Promise<GitHubBranch> {
  const repository = await getRepository(owner, repo, token);
  const branches = await getBranches(owner, repo, token);
  
  const defaultBranch = branches.find(branch => branch.name === repository.default_branch);
  
  if (!defaultBranch) {
    throw new Error(`Default branch ${repository.default_branch} not found`);
  }
  
  return defaultBranch;
}

// Export default client for direct usage if needed
export { defaultClient };