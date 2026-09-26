/**
 * GitHub Business Services
 * Business logic for GitHub data processing and metrics calculation
 */

import { 
  githubRepositoryRepository,
  githubBranchRepository,
  githubCommitRepository,
  githubPullRequestRepository,
  githubIssueRepository,
  githubReleaseRepository,
  githubContributorRepository
} from './repositories';
import type { 
  GitHubActivityMetrics, 
  GitHubRepositoryMetadata 
} from './types';

/**
 * Calculate repository health score
 * Based on recent activity, issues, pull requests, etc.
 */
function calculateRepositoryHealth(
  openIssues: number, 
  openPRs: number, 
  commitsThisWeek: number,
  releases: number
): number {
  // Base score
  let score = 50;
  
  // Add points for recent commits (max 20 points)
  score += Math.min(commitsThisWeek * 2, 20);
  
  // Subtract points for open issues (max -15 points)
  score -= Math.min(openIssues, 15);
  
  // Subtract points for open PRs (max -10 points)
  score -= Math.min(openPRs * 2, 10);
  
  // Add points for releases (max 5 points)
  score += Math.min(releases, 5);
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * GitHub Service
 * Main service for GitHub data processing
 */
export const githubService = {
  /**
   * Get repository connection status
   */
  getRepositoryConnection: async (owner: string, repo: string, token?: string) => {
    try {
      const repository = await githubRepositoryRepository.getRepository(owner, repo, token);
      return {
        connected: true,
        repository: repository.full_name,
        private: repository.private,
        createdAt: repository.created_at
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  /**
   * Get repository metadata
   */
  getRepositoryMetadata: async (owner: string, repo: string, token?: string): Promise<GitHubRepositoryMetadata> => {
    const repository = await githubRepositoryRepository.getRepository(owner, repo, token);
    
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
  },
  
  /**
   * Get repository activity metrics
   */
  getRepositoryActivity: async (owner: string, repo: string, token?: string): Promise<GitHubActivityMetrics> => {
    // Fetch all required data in parallel
    const [recentCommits, openPRs, openIssues, releases, contributors, repository] = await Promise.all([
      githubCommitRepository.getRecent(owner, repo, token),
      githubPullRequestRepository.getOpen(owner, repo, token),
      githubIssueRepository.getOpen(owner, repo, token),
      githubReleaseRepository.getAll(owner, repo, token),
      githubContributorRepository.getAll(owner, repo, token),
      githubRepositoryRepository.getRepository(owner, repo, token)
    ]);
    
    // Calculate metrics
    const commitsThisWeek = recentCommits.length;
    const openPRsCount = openPRs.length;
    const openIssuesCount = openIssues.length;
    const releasesCount = releases.length;
    const contributorsCount = contributors.length;
    
    // Get last commit date
    const lastCommit = recentCommits[0];
    const lastCommitDate = lastCommit ? lastCommit.commit.author.date : null;
    
    // Calculate repository health
    const repositoryHealth = calculateRepositoryHealth(
      openIssuesCount, 
      openPRsCount, 
      commitsThisWeek,
      releasesCount
    );
    
    // Get default branch
    const defaultBranch = repository.default_branch;
    
    return {
      commitsThisWeek,
      openPRs: openPRsCount,
      openIssues: openIssuesCount,
      releases: releasesCount,
      contributors: contributorsCount,
      repositoryHealth,
      lastCommitDate,
      defaultBranch,
      lastDeploymentCommit: null // This would be determined by deployment tracking
    };
  },
  
  /**
   * Get repository branches
   */
  getBranches: async (owner: string, repo: string, token?: string) => {
    return await githubBranchRepository.getAll(owner, repo, token);
  },
  
  /**
   * Get repository commits
   */
  getCommits: async (owner: string, repo: string, token?: string, options?: { 
    sha?: string; 
    path?: string; 
    author?: string; 
    since?: string; 
    until?: string; 
    per_page?: number 
  }) => {
    return await githubCommitRepository.getAll(owner, repo, token, options);
  },
  
  /**
   * Get repository pull requests
   */
  getPullRequests: async (owner: string, repo: string, token?: string, state: 'open' | 'closed' | 'all' = 'open') => {
    return await githubPullRequestRepository.getAll(owner, repo, token, state);
  },
  
  /**
   * Get repository issues
   */
  getIssues: async (owner: string, repo: string, token?: string, state: 'open' | 'closed' | 'all' = 'open') => {
    return await githubIssueRepository.getAll(owner, repo, token, state);
  },
  
  /**
   * Get repository releases
   */
  getReleases: async (owner: string, repo: string, token?: string) => {
    return await githubReleaseRepository.getAll(owner, repo, token);
  },
  
  /**
   * Get repository contributors
   */
  getContributors: async (owner: string, repo: string, token?: string) => {
    return await githubContributorRepository.getAll(owner, repo, token);
  },
  
  /**
   * Get recent commits
   */
  getRecentCommits: async (owner: string, repo: string, token?: string) => {
    return await githubCommitRepository.getRecent(owner, repo, token);
  },
  
  /**
   * Get default branch
   */
  getDefaultBranch: async (owner: string, repo: string, token?: string) => {
    return await githubBranchRepository.getDefault(owner, repo, token);
  }
};