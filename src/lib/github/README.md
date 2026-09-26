# GitHub Integration

## Overview

The GitHub integration module provides real-time data fetching from GitHub repositories to power the executive dashboard and engineering pipeline.

## Architecture

```
src/lib/github/
├── client.ts          # GitHub API client
├── repositories.ts    # Data repositories for GitHub entities
├── services.ts        # Business logic services
├── types.ts           # TypeScript types
└── hooks/             # React hooks for GitHub data
```

## Components

### Client (`client.ts`)
- GitHub API client using Octokit
- Authentication handling
- Rate limiting management

### Repositories (`repositories.ts`)
- Repository pattern implementation for GitHub entities
- Data fetching and caching logic
- Error handling and retry mechanisms

### Services (`services.ts`)
- Business logic for GitHub data processing
- Metrics calculation
- Data transformation for dashboard consumption

### Types (`types.ts`)
- TypeScript definitions for all GitHub entities
- Strict typing for API responses
- Consistent data structures

### Hooks (`hooks/`)
- React hooks for integrating GitHub data in components
- State management for loading/error states
- Real-time data updates

## Usage

```typescript
import { useGitHubRepository } from '@/lib/github/hooks'
import { githubService } from '@/lib/github/services'

// In a component
const { data: repoData, loading, error } = useGitHubRepository('owner', 'repo')

// In a service
const metrics = await githubService.getRepositoryMetrics('owner', 'repo')
```