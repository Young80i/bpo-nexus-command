/**
 * Engineering Delivery Pipeline
 * Types for the complete software delivery lifecycle
 */

// Engineering Lifecycle Stages
export type EngineeringStage = 
  | 'client-request'
  | 'requirements-analysis'
  | 'lovable-prompt-generation'
  | 'lovable-application-development'
  | 'repository-import'
  | 'repository-scan'
  | 'continue-prompt-generation'
  | 'continue-implementation'
  | 'engineering-review'
  | 'node-validation'
  | 'github-commit-push'
  | 'deployment'
  | 'client-delivery'
  | 'engineering-memory';

// Platform Types
export type Platform = 'lovable' | 'continue' | 'github' | 'deployment' | 'client';

// Project Status
export type ProjectStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'on-hold';

// Risk Level
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Blocker Types
export type BlockerType = 
  | 'technical'
  | 'resource'
  | 'dependency'
  | 'approval'
  | 'external'
  | 'other';

// Project Pipeline
export type ProjectPipeline = {
  id: string;
  projectId: string;
  projectName: string;
  currentStage: EngineeringStage;
  nextStage: EngineeringStage | null;
  completedStages: EngineeringStage[];
  pendingStages: EngineeringStage[];
  currentPlatform: Platform;
  repositoryConfidence: number; // 0-100 scale
  implementationRisk: RiskLevel;
  estimatedCompletion: string; // ISO date string
  blockers: Blocker[];
  engineeringNotes: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

// Blocker
export type Blocker = {
  id: string;
  type: BlockerType;
  description: string;
  createdAt: string; // ISO date string
  resolvedAt: string | null; // ISO date string or null
  resolutionNotes: string;
};

// Engineering Memory Record
export type EngineeringMemoryRecord = {
  id: string;
  projectId: string;
  stage: EngineeringStage;
  timestamp: string; // ISO date string
  decision: string;
  reason: string;
  repositoryEvidence: string;
  approval: boolean;
  confidence: number; // 0-100 scale
};

// Prompt Orchestration
export type PromptOrchestration = {
  id: string;
  projectId: string;
  platform: Platform;
  promptContent: string;
  generatedAt: string; // ISO date string
  executedAt: string | null; // ISO date string or null
  result: string | null;
  success: boolean;
};

// Reuse Analysis Record
export type ReuseAnalysisRecord = {
  id: string;
  projectId: string;
  artifactType: 'page' | 'card' | 'component' | 'store' | 'context' | 'hook' | 'utility' | 'workflow' | 'navigation';
  artifactName: string;
  filePath: string;
  reuseDecision: 'reuse' | 'extend' | 'create-new';
  reason: string;
  confidence: number; // 0-100 scale
  analyzedAt: string; // ISO date string
};