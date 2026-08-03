/**
 * Engineering Delivery Pipeline
 * Types for the Engineering Lifecycle
 */

// Pipeline stages
export type PipelineStage =
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

// Project status
export type ProjectStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'on-hold';

// Platform types
export type Platform = 'lovable' | 'continue' | 'github' | 'node' | 'deployment';

// Decision record for engineering memory
export type EngineeringDecision = {
  id: string;
  stage: PipelineStage;
  timestamp: string;
  decision: string;
  reason: string;
  repositoryEvidence: string;
  approved: boolean;
  confidence: number; // 0-100 scale
};

// Pipeline item representing a project in the delivery pipeline
export type PipelineItem = {
  id: string;
  projectId: string;
  projectName: string;
  currentStage: PipelineStage;
  nextStage: PipelineStage | null;
  completedStages: PipelineStage[];
  pendingStages: PipelineStage[];
  currentPlatform: Platform;
  repositoryConfidence: number; // 0-100 scale
  implementationRisk: 'low' | 'medium' | 'high' | 'critical';
  estimatedCompletion: string; // ISO date string
  blockers: string[];
  engineeringNotes: string;
  decisions: EngineeringDecision[];
  createdAt: string;
  updatedAt: string;
};

// Repository scan result
export type RepositoryScan = {
  id: string;
  pipelineItemId: string;
  timestamp: string;
  repositoryIntelligence: any; // Would be RepositoryModel from repository-intelligence
  architectureQuality: any; // Would be ArchitectureQualityModel from architecture-intelligence
  findings: string[];
  recommendations: string[];
};

// Prompt generation record
export type PromptGeneration = {
  id: string;
  pipelineItemId: string;
  platform: Platform;
  timestamp: string;
  promptContent: string;
  generatedBy: string; // AI model or user
  purpose: string;
  used: boolean;
};

// Implementation record
export type ImplementationRecord = {
  id: string;
  pipelineItemId: string;
  timestamp: string;
  changes: string[];
  filesModified: string[];
  filesCreated: string[];
  validationResults: string[];
  reviewer: string;
  approved: boolean;
};

// Deployment record
export type DeploymentRecord = {
  id: string;
  pipelineItemId: string;
  timestamp: string;
  environment: 'development' | 'staging' | 'production';
  commitHash: string;
  deploymentUrl: string;
  status: 'success' | 'failed' | 'in-progress';
  logs: string;
};

// Client delivery record
export type ClientDelivery = {
  id: string;
  pipelineItemId: string;
  timestamp: string;
  deliveryMethod: string;
  deliveryUrl: string;
  clientFeedback: string;
  satisfactionScore: number; // 1-5 scale
  followUpRequired: boolean;
};

// Complete pipeline model
export type EngineeringPipeline = {
  id: string;
  items: PipelineItem[];
  scans: RepositoryScan[];
  prompts: PromptGeneration[];
  implementations: ImplementationRecord[];
  deployments: DeploymentRecord[];
  deliveries: ClientDelivery[];
  createdAt: string;
  updatedAt: string;
};