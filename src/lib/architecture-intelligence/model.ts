/**
 * Architecture Intelligence Engine
 * Architecture Quality Model Implementation
 */

import type {
  ArchitectureQualityModel,
  FeatureQuality,
  ComponentQuality,
  ModuleQuality
} from './types';

/**
 * Creates a new architecture quality model
 */
export function createArchitectureQualityModel(name: string, repositoryModelVersion: string): ArchitectureQualityModel {
  return {
    id: `aqm-${Date.now()}`,
    name,
    features: [],
    sharedComponents: [],
    utilities: [],
    hooks: [],
    stores: [],
    overallQualityScore: 0,
    totalArchitecturalDebt: 0,
    lastAnalyzed: new Date().toISOString(),
    repositoryModelVersion
  };
}

/**
 * Adds feature quality to the architecture model
 */
export function addFeatureQuality(model: ArchitectureQualityModel, feature: FeatureQuality): ArchitectureQualityModel {
  return {
    ...model,
    features: [...model.features, feature],
    overallQualityScore: calculateOverallQuality([...model.features, feature]),
    totalArchitecturalDebt: calculateTotalDebt([...model.features, feature]),
    lastAnalyzed: new Date().toISOString()
  };
}

/**
 * Adds shared component quality to the architecture model
 */
export function addSharedComponentQuality(model: ArchitectureQualityModel, component: ComponentQuality): ArchitectureQualityModel {
  return {
    ...model,
    sharedComponents: [...model.sharedComponents, component],
    overallQualityScore: calculateOverallQuality(model.features, [...model.sharedComponents, component]),
    lastAnalyzed: new Date().toISOString()
  };
}

/**
 * Adds utility quality to the architecture model
 */
export function addUtilityQuality(model: ArchitectureQualityModel, utility: ModuleQuality): ArchitectureQualityModel {
  return {
    ...model,
    utilities: [...model.utilities, utility],
    overallQualityScore: calculateOverallQuality(model.features, model.sharedComponents, [...model.utilities, utility]),
    lastAnalyzed: new Date().toISOString()
  };
}

/**
 * Adds hook quality to the architecture model
 */
export function addHookQuality(model: ArchitectureQualityModel, hook: ModuleQuality): ArchitectureQualityModel {
  return {
    ...model,
    hooks: [...model.hooks, hook],
    overallQualityScore: calculateOverallQuality(model.features, model.sharedComponents, model.utilities, [...model.hooks, hook]),
    lastAnalyzed: new Date().toISOString()
  };
}

/**
 * Adds store quality to the architecture model
 */
export function addStoreQuality(model: ArchitectureQualityModel, store: ModuleQuality): ArchitectureQualityModel {
  return {
    ...model,
    stores: [...model.stores, store],
    overallQualityScore: calculateOverallQuality(
      model.features, 
      model.sharedComponents, 
      model.utilities, 
      model.hooks, 
      [...model.stores, store]
    ),
    lastAnalyzed: new Date().toISOString()
  };
}

/**
 * Calculate overall quality score
 */
function calculateOverallQuality(
  features: FeatureQuality[] = [],
  sharedComponents: ComponentQuality[] = [],
  utilities: ModuleQuality[] = [],
  hooks: ModuleQuality[] = [],
  stores: ModuleQuality[] = []
): number {
  const allScores = [
    ...features.map(f => f.overallQualityScore),
    ...sharedComponents.map(c => c.qualityScore),
    ...utilities.map(u => u.qualityScore),
    ...hooks.map(h => h.qualityScore),
    ...stores.map(s => s.qualityScore)
  ];
  
  if (allScores.length === 0) return 0;
  
  const sum = allScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / allScores.length);
}

/**
 * Calculate total architectural debt
 */
function calculateTotalDebt(features: FeatureQuality[]): number {
  return features.reduce((total, feature) => total + feature.architecturalDebt, 0);
}