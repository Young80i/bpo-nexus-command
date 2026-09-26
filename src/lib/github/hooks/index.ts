/**
 * GitHub React Hooks
 * Custom hooks for integrating GitHub data in React components
 */

import { useState, useEffect } from 'react';
import { githubService } from '../services';
import type { 
  GitHubRepositoryMetadata, 
  GitHubActivityMetrics,
  GitHubBranch,
  GitHubCommit,
  GitHubPullRequest,
  GitHubIssue,
  GitHubRelease,
  GitHubContributor
} from '../types';

/**
 * Hook for GitHub repository connection status
 */
export function useGitHubRepositoryConnection(owner: string, repo: string, token?: string) {
  const [data, setData] = useState<{ 
    connected: boolean; 
    repository?: string; 
    private?: boolean; 
    createdAt?: string; 
    error?: string 
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchConnectionStatus = async () => {
      try {
        setLoading(true);
        const result = await githubService.getRepositoryConnection(owner, repo, token);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchConnectionStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token]);

  return { data, loading, error };
}

/**
 * Hook for GitHub repository metadata
 */
export function useGitHubRepositoryMetadata(owner: string, repo: string, token?: string) {
  const [data, setData] = useState<GitHubRepositoryMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const result = await githubService.getRepositoryMetadata(owner, repo, token);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchMetadata();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token]);

  return { data, loading, error };
}

/**
 * Hook for GitHub repository activity metrics
 */
export function useGitHubActivityMetrics(owner: string, repo: string, token?: string) {
  const [data, setData] = useState<GitHubActivityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchActivityMetrics = async () => {
      try {
        setLoading(true);
        const result = await githubService.getRepositoryActivity(owner, repo, token);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchActivityMetrics();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token]);

  return { data, loading, error };
}

/**
 * Hook for GitHub branches
 */
export function useGitHubBranches(owner: string, repo: string, token?: string) {
  const [data, setData] = useState<GitHubBranch[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const result = await githubService.getBranches(owner, repo, token);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchBranches();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token]);

  return { data, loading, error };
}

/**
 * Hook for GitHub commits
 */
export function useGitHubCommits(
  owner: string, 
  repo: string, 
  token?: string, 
  options?: { 
    sha?: string; 
    path?: string; 
    author?: string; 
    since?: string; 
    until?: string; 
    per_page?: number 
  }
) {
  const [data, setData] = useState<GitHubCommit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCommits = async () => {
      try {
        setLoading(true);
        const result = await githubService.getCommits(owner, repo, token, options);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchCommits();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token, options]);

  return { data, loading, error };
}

/**
 * Hook for GitHub pull requests
 */
export function useGitHubPullRequests(
  owner: string, 
  repo: string, 
  token?: string, 
  state: 'open' | 'closed' | 'all' = 'open'
) {
  const [data, setData] = useState<GitHubPullRequest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPullRequests = async () => {
      try {
        setLoading(true);
        const result = await githubService.getPullRequests(owner, repo, token, state);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchPullRequests();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token, state]);

  return { data, loading, error };
}

/**
 * Hook for GitHub issues
 */
export function useGitHubIssues(
  owner: string, 
  repo: string, 
  token?: string, 
  state: 'open' | 'closed' | 'all' = 'open'
) {
  const [data, setData] = useState<GitHubIssue[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const result = await githubService.getIssues(owner, repo, token, state);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchIssues();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token, state]);

  return { data, loading, error };
}

/**
 * Hook for GitHub releases
 */
export function useGitHubReleases(owner: string, repo: string, token?: string) {
  const [data, setData] = useState<GitHubRelease[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const result = await githubService.getReleases(owner, repo, token);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchReleases();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token]);

  return { data, loading, error };
}

/**
 * Hook for GitHub contributors
 */
export function useGitHubContributors(owner: string, repo: string, token?: string) {
  const [data, setData] = useState<GitHubContributor[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchContributors = async () => {
      try {
        setLoading(true);
        const result = await githubService.getContributors(owner, repo, token);
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (owner && repo) {
      fetchContributors();
    }

    return () => {
      isMounted = false;
    };
  }, [owner, repo, token]);

  return { data, loading, error };
}