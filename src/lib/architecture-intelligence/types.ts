/**
 * Architecture Intelligence Engine
 * Types for Architecture Quality Metrics
 */

// Basic metrics
export type SizeMetric = {
  linesOfCode: number;
  fileSize: number; // in bytes
  componentCount: number;
  exportCount: number;
};

export type ComplexityMetric = {
  cyclomaticComplexity: number;
  nestingDepth: number;
  functionCount: number;
  hookUsage: number;
};

export type CouplingMetric = {
  directDependencies: number;
  transitiveDependencies: number;
  dependencyTypes: Record<string, number>;
  fanIn: number;
  fanOut: number;
};

export type CohesionMetric = {
  functionalCohesion: number; // 0-1 scale
  communicationalCohesion: number; // 0-1 scale
  sequentialCohesion: number; // 0-1 scale
};

// Quality indicators
export type ArchitecturalDrift = {
  id: string;
  componentName: string;
  filePath: string;
  deviationType: 'pattern-violation' | 'naming-inconsistency' | 'boundary-crossing' | 'anti-pattern';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
};

export type NamingViolation = {
  id: string;
  filePath: string;
  entityName: string;
  violationType: 'case-mismatch' | 'convention-violation' | 'inconsistent-naming';
  expectedPattern: string;
  actualName: string;
};

export type AntiPattern = {
  id: string;
  filePath: string;
  patternType: 'god-component' | 'feature-envy' | 'inappropriate-intimacy' | 'shotgun-surgery';
  description: string;
  affectedEntities: string[];
};

// Module quality
export type ModuleQuality = {
  id: string;
  name: string;
  filePath: string;
  size: SizeMetric;
  complexity: ComplexityMetric;
  coupling: CouplingMetric;
  cohesion: CohesionMetric;
  architecturalDrifts: ArchitecturalDrift[];
  namingViolations: NamingViolation[];
  antiPatterns: AntiPattern[];
  qualityScore: number; // 0-100 scale
};

// Component quality
export type ComponentQuality = {
  id: string;
  name: string;
  filePath: string;
  type: 'ui' | 'business' | 'layout' | 'shared';
  size: SizeMetric;
  complexity: ComplexityMetric;
  coupling: CouplingMetric;
  cohesion: CohesionMetric;
  architecturalDrifts: ArchitecturalDrift[];
  namingViolations: NamingViolation[];
  antiPatterns: AntiPattern[];
  qualityScore: number; // 0-100 scale
};

// Feature quality
export type FeatureQuality = {
  id: string;
  name: string;
  routes: string[];
  moduleQuality: ModuleQuality[];
  componentQuality: ComponentQuality[];
  overallQualityScore: number; // 0-100 scale
  architecturalDebt: number; // Estimated effort to fix issues
};

// Architecture quality model
export type ArchitectureQualityModel = {
  id: string;
  name: string;
  features: FeatureQuality[];
  sharedComponents: ComponentQuality[];
  utilities: ModuleQuality[];
  hooks: ModuleQuality[];
  stores: ModuleQuality[];
  overallQualityScore: number; // 0-100 scale
  totalArchitecturalDebt: number; // Total estimated effort
  lastAnalyzed: string;
  repositoryModelVersion: string;
};