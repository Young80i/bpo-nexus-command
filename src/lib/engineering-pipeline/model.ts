/**
 * Engineering Delivery Pipeline
 * Pipeline Model and State Management
 */

import type {
  EngineeringPipeline,
  PipelineItem,
  PipelineStage,
  RepositoryScan,
  PromptGeneration,
  ImplementationRecord,
  DeploymentRecord,
  ClientDelivery
} from './types';

/**
 * Create a new engineering pipeline
 */
export function createEngineeringPipeline(): EngineeringPipeline {
  return {
    id: `pipeline-${Date.now()}`,
    items: [],
    scans: [],
    prompts: [],
    implementations: [],
    deployments: [],
    deliveries: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Add a new item to the pipeline
 */
export function addPipelineItem(pipeline: EngineeringPipeline, item: PipelineItem): EngineeringPipeline {
  return {
    ...pipeline,
    items: [...pipeline.items, item],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Update a pipeline item
 */
export function updatePipelineItem(
  pipeline: EngineeringPipeline, 
  itemId: string, 
  updates: Partial<PipelineItem>
): EngineeringPipeline {
  return {
    ...pipeline,
    items: pipeline.items.map(item => 
      item.id === itemId ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    ),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Move a pipeline item to the next stage
 */
export function advancePipelineItem(pipeline: EngineeringPipeline, itemId: string): EngineeringPipeline {
  const item = pipeline.items.find(i => i.id === itemId);
  if (!item) return pipeline;

  const currentIndex = getStageIndex(item.currentStage);
  const nextIndex = currentIndex + 1;
  
  // If we've reached the end of the pipeline
  if (nextIndex >= PIPELINE_STAGES.length) {
    return updatePipelineItem(pipeline, itemId, {
      currentStage: 'engineering-memory',
      nextStage: null,
      completedStages: [...item.completedStages, item.currentStage]
    });
  }

  const nextStage = PIPELINE_STAGES[nextIndex];
  
  return updatePipelineItem(pipeline, itemId, {
    currentStage: nextStage,
    nextStage: nextIndex + 1 < PIPELINE_STAGES.length ? PIPELINE_STAGES[nextIndex + 1] : null,
    completedStages: [...item.completedStages, item.currentStage],
    pendingStages: item.pendingStages.filter(stage => stage !== nextStage)
  });
}

/**
 * Add a repository scan result
 */
export function addRepositoryScan(pipeline: EngineeringPipeline, scan: RepositoryScan): EngineeringPipeline {
  return {
    ...pipeline,
    scans: [...pipeline.scans, scan],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Add a prompt generation record
 */
export function addPromptGeneration(pipeline: EngineeringPipeline, prompt: PromptGeneration): EngineeringPipeline {
  return {
    ...pipeline,
    prompts: [...pipeline.prompts, prompt],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Add an implementation record
 */
export function addImplementationRecord(pipeline: EngineeringPipeline, impl: ImplementationRecord): EngineeringPipeline {
  return {
    ...pipeline,
    implementations: [...pipeline.implementations, impl],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Add a deployment record
 */
export function addDeploymentRecord(pipeline: EngineeringPipeline, deployment: DeploymentRecord): EngineeringPipeline {
  return {
    ...pipeline,
    deployments: [...pipeline.deployments, deployment],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Add a client delivery record
 */
export function addClientDelivery(pipeline: EngineeringPipeline, delivery: ClientDelivery): EngineeringPipeline {
  return {
    ...pipeline,
    deliveries: [...pipeline.deliveries, delivery],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get the index of a stage in the pipeline
 */
function getStageIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

/**
 * Pipeline stages in order
 */
export const PIPELINE_STAGES: PipelineStage[] = [
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