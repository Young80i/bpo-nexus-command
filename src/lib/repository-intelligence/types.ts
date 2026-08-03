/**
 * Repository Intelligence Engine
 * Types for Repository Entities
 */

export type Route = {
  id: string;
  path: string;
  filePath: string;
  componentName: string;
  isLayout: boolean;
  isRoot: boolean;
  children?: Route[];
};

export type Component = {
  id: string;
  name: string;
  filePath: string;
  type: 'ui' | 'business' | 'layout' | 'shared';
  exports: string[];
};

export type Store = {
  id: string;
  name: string;
  filePath: string;
  stateVariables: string[];
  actions: string[];
};

export type Utility = {
  id: string;
  name: string;
  filePath: string;
  functions: string[];
};

export type Hook = {
  id: string;
  name: string;
  filePath: string;
  functions: string[];
};

export type Feature = {
  id: string;
  name: string;
  routes: Route[];
  components: Component[];
  stores: Store[];
  utilities: Utility[];
  hooks: Hook[];
};

export type Dependency = {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'export' | 'dependency';
};

export type RepositoryEntity = Route | Component | Store | Utility | Hook | Feature;

export type RepositoryModel = {
  id: string;
  name: string;
  features: Feature[];
  sharedComponents: Component[];
  utilities: Utility[];
  hooks: Hook[];
  stores: Store[];
  dependencies: Dependency[];
  lastUpdated: string;
};