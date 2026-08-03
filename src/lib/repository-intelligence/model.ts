/**
 * Repository Intelligence Engine
 * Repository Model Implementation
 */

import type {
  RepositoryModel,
  Feature,
  Route,
  Component,
  Store,
  Utility,
  Hook,
  Dependency
} from './types';

/**
 * Creates a new repository model
 */
export function createRepositoryModel(name: string): RepositoryModel {
  return {
    id: `repo-${Date.now()}`,
    name,
    features: [],
    sharedComponents: [],
    utilities: [],
    hooks: [],
    stores: [],
    dependencies: [],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Adds a feature to the repository model
 */
export function addFeature(model: RepositoryModel, feature: Feature): RepositoryModel {
  return {
    ...model,
    features: [...model.features, feature],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Adds a shared component to the repository model
 */
export function addSharedComponent(model: RepositoryModel, component: Component): RepositoryModel {
  return {
    ...model,
    sharedComponents: [...model.sharedComponents, component],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Adds a utility to the repository model
 */
export function addUtility(model: RepositoryModel, utility: Utility): RepositoryModel {
  return {
    ...model,
    utilities: [...model.utilities, utility],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Adds a hook to the repository model
 */
export function addHook(model: RepositoryModel, hook: Hook): RepositoryModel {
  return {
    ...model,
    hooks: [...model.hooks, hook],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Adds a store to the repository model
 */
export function addStore(model: RepositoryModel, store: Store): RepositoryModel {
  return {
    ...model,
    stores: [...model.stores, store],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Adds a dependency to the repository model
 */
export function addDependency(model: RepositoryModel, dependency: Dependency): RepositoryModel {
  return {
    ...model,
    dependencies: [...model.dependencies, dependency],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Updates the last updated timestamp
 */
export function updateTimestamp(model: RepositoryModel): RepositoryModel {
  return {
    ...model,
    lastUpdated: new Date().toISOString()
  };
}