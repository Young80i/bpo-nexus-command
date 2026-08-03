/**
 * Engineering Delivery Pipeline
 * Main pipeline management and tracking
 */

import { 
  ProjectPipeline, 
  EngineeringStage, 
  Platform, 
  Blocker,
  RiskLevel
} from './types';

// Stage order definition
const STAGE_ORDER: EngineeringStage[] = [
  'client-request',
  'requirements-analysis',
  'lovable-prompt-generation',
  'lovable-application-development',
  'repository-import',
  'repository-scan',
  'continue-prompt-generation',
  'continue-implementation',
  'engineering-review',
  'node-validation',
  'github-commit-push',
  'deployment',
  'client-delivery',
  'engineering-memory'
];

// Get next stage in the pipeline
export function getNextStage(currentStage: EngineeringStage): EngineeringStage | null {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === STAGE_ORDER.length - 1) {
    return null;
  }
  return STAGE_ORDER[currentIndex + 1];
}

// Get previous stage in the pipeline
export function getPreviousStage(currentStage: EngineeringStage): EngineeringStage | null {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }
  return STAGE_ORDER[currentIndex - 1];
}

// Get all pending stages from current stage
export function getPendingStages(currentStage: EngineeringStage): EngineeringStage[] {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1) {
    return [];
  }
  return STAGE_ORDER.slice(currentIndex + 1);
}

// Get all completed stages up to current stage
export function getCompletedStages(currentStage: EngineeringStage): EngineeringStage[] {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1) {
    return [];
  }
  return STAGE_ORDER.slice(0, currentIndex);
}

// Determine platform based on stage
export function getPlatformForStage(stage: EngineeringStage): Platform {
  switch (stage) {
    case 'lovable-prompt-generation':
    case 'lovable-application-development':
      return 'lovable';
    case 'continue-prompt-generation':
    case 'continue-implementation':
    case 'repository-scan':
      return 'continue';
    case 'github-commit-push':
      return 'github';
    case 'deployment':
      return 'deployment';
    case 'client-request':
    case 'client-delivery':
      return 'client';
    default:
      return 'continue';
  }
}

// Initialize a new project pipeline
export function initializeProjectPipeline(
  projectId: string,
  projectName: string
): ProjectPipeline {
  return {
    id: `${projectId}-pipeline`,
    projectId,
    projectName,
    currentStage: 'client-request',
    nextStage: getNextStage('client-request'),
    completedStages: [],
    pendingStages: getPendingStages('client-request'),
    currentPlatform: getPlatformForStage('client-request'),
    repositoryConfidence: 0,
    implementationRisk: 'low',
    estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    blockers: [],
    engineeringNotes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Advance pipeline to next stage
export function advancePipelineStage(pipeline: ProjectPipeline): ProjectPipeline {
  if (!pipeline.nextStage) {
    // Already at final stage
    return pipeline;
  }

  const updatedPipeline = {
    ...pipeline,
    currentStage: pipeline.nextStage,
    nextStage: getNextStage(pipeline.nextStage),
    completedStages: [...pipeline.completedStages, pipeline.currentStage],
    pendingStages: getPendingStages(pipeline.nextStage),
    currentPlatform: getPlatformForStage(pipeline.nextStage),
    updatedAt: new Date().toISOString()
  };

  return updatedPipeline;
}

// Add blocker to pipeline
export function addBlockerToPipeline(
  pipeline: ProjectPipeline,
  blocker: Omit<Blocker, 'id' | 'createdAt' | 'resolvedAt'>
): ProjectPipeline {
  const newBlocker: Blocker = {
    id: `blocker-${Date.now()}`,
    ...blocker,
    createdAt: new Date().toISOString(),
    resolvedAt: null
  };

  return {
    ...pipeline,
    blockers: [...pipeline.blockers, newBlocker],
    implementationRisk: calculateRiskWithBlockers(pipeline.implementationRisk, pipeline.blockers.length + 1),
    updatedAt: new Date().toISOString()
  };
}

// Resolve blocker
export function resolveBlocker(
  pipeline: ProjectPipeline,
  blockerId: string,
  resolutionNotes: string
): ProjectPipeline {
  const updatedBlockers = pipeline.blockers.map(blocker => {
    if (blocker.id === blockerId) {
      return {
        ...blocker,
        resolvedAt: new Date().toISOString(),
        resolutionNotes
      };
    }
    return blocker;
  });

  // Filter out resolved blockers
  const unresolvedBlockers = updatedBlockers.filter(b => b.resolvedAt === null);

  return {
    ...pipeline,
    blockers: updatedBlockers,
    implementationRisk: calculateRiskWithBlockers(pipeline.implementationRisk, unresolvedBlockers.length),
    updatedAt: new Date().toISOString()
  };
}

// Calculate risk level based on number of blockers
function calculateRiskWithBlockers(currentRisk: RiskLevel, blockerCount: number): RiskLevel {
  if (blockerCount === 0) return 'low';
  if (blockerCount === 1) return currentRisk === 'critical' ? 'critical' : 'medium';
  if (blockerCount === 2) return currentRisk === 'low' ? 'medium' : 'high';
  return 'critical';
}

// Add engineering note
export function addEngineeringNote(
  pipeline: ProjectPipeline,
  note: string
): ProjectPipeline {
  return {
    ...pipeline,
    engineeringNotes: [...pipeline.engineeringNotes, note],
    updatedAt: new Date().toISOString()
  };
}

// Update repository confidence
export function updateRepositoryConfidence(
  pipeline: ProjectPipeline,
  confidence: number
): ProjectPipeline {
  return {
    ...pipeline,
    repositoryConfidence: Math.max(0, Math.min(100, confidence)),
    updatedAt: new Date().toISOString()
  };
}

// Update implementation risk
export function updateImplementationRisk(
  pipeline: ProjectPipeline,
  risk: RiskLevel
): ProjectPipeline {
  return {
    ...pipeline,
    implementationRisk: risk,
    updatedAt: new Date().toISOString()
  };
}

// Update estimated completion date
export function updateEstimatedCompletion(
  pipeline: ProjectPipeline,
  estimatedCompletion: string
): ProjectPipeline {
  return {
    ...pipeline,
    estimatedCompletion,
    updatedAt: new Date().toISOString()
  };
}