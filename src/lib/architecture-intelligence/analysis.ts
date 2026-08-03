/**
 * Architecture Intelligence Engine
 * Architecture Analysis Functions
 */

import type {
  ModuleQuality,
  ComponentQuality,
  FeatureQuality,
  ArchitecturalDrift,
  NamingViolation,
  AntiPattern
} from './types';
import type { RepositoryModel, Feature, Component, Store, Utility, Hook } from '../repository-intelligence/types';
import { calculateSizeMetrics, calculateComplexityMetrics, calculateCouplingMetrics, calculateCohesionMetrics } from './metrics';

/**
 * Analyze the overall architecture quality
 * This function would take a repository model and produce quality metrics
 */
export function analyzeArchitecture(repositoryModel: RepositoryModel): FeatureQuality[] {
  // In a real implementation, this would analyze each feature in detail
  return repositoryModel.features.map(feature => analyzeFeature(feature));
}

/**
 * Analyze a single feature for quality metrics
 */
export function analyzeFeature(feature: Feature): FeatureQuality {
  // Analyze routes, components, stores, utilities, and hooks
  const moduleQuality = feature.routes.map(route => analyzeModule(route.filePath, route.componentName));
  const componentQuality = feature.components.map(component => analyzeComponent(component));
  
  // Calculate overall quality score
  const allScores = [
    ...moduleQuality.map(m => m.qualityScore),
    ...componentQuality.map(c => c.qualityScore)
  ];
  
  const overallQualityScore = allScores.length > 0 
    ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
    : 100;
  
  // Estimate architectural debt (in hours of work to fix issues)
  const architecturalDebt = calculateArchitecturalDebt([
    ...moduleQuality.flatMap(m => m.architecturalDrifts),
    ...componentQuality.flatMap(c => c.architecturalDrifts)
  ]);
  
  return {
    id: feature.id,
    name: feature.name,
    routes: feature.routes.map(r => r.filePath),
    moduleQuality,
    componentQuality,
    overallQualityScore,
    architecturalDebt
  };
}

/**
 * Analyze a module (route file) for quality metrics
 */
export function analyzeModule(filePath: string, componentName: string): ModuleQuality {
  // In a real implementation, this would read the actual file content
  // For now, we'll use placeholder content
  const content = `// Placeholder content for ${componentName}\nexport function ${componentName}() {\n  return <div>${componentName}</div>;\n}`;
  
  const size = calculateSizeMetrics(filePath, content);
  const complexity = calculateComplexityMetrics(filePath, content);
  const coupling = calculateCouplingMetrics(filePath, content);
  const cohesion = calculateCohesionMetrics(filePath, content);
  
  // Identify architectural drifts
  const architecturalDrifts = identifyArchitecturalDrifts(filePath, componentName, content);
  
  // Identify naming violations
  const namingViolations = identifyNamingViolations(filePath, componentName);
  
  // Identify anti-patterns
  const antiPatterns = identifyAntiPatterns(filePath, content);
  
  // Calculate quality score (simplified)
  const qualityScore = calculateModuleQualityScore(size, complexity, coupling, cohesion);
  
  return {
    id: `module-${filePath.replace(/[\/\\]/g, '-')}`,
    name: componentName,
    filePath,
    size,
    complexity,
    coupling,
    cohesion,
    architecturalDrifts,
    namingViolations,
    antiPatterns,
    qualityScore
  };
}

/**
 * Analyze a component for quality metrics
 */
export function analyzeComponent(component: Component): ComponentQuality {
  // In a real implementation, this would read the actual file content
  const content = `// Placeholder content for ${component.name}\nexport function ${component.name}() {\n  return <div>${component.name}</div>;\n}`;
  
  const size = calculateSizeMetrics(component.filePath, content);
  const complexity = calculateComplexityMetrics(component.filePath, content);
  const coupling = calculateCouplingMetrics(component.filePath, content);
  const cohesion = calculateCohesionMetrics(component.filePath, content);
  
  // Identify architectural drifts
  const architecturalDrifts = identifyArchitecturalDrifts(component.filePath, component.name, content);
  
  // Identify naming violations
  const namingViolations = identifyNamingViolations(component.filePath, component.name);
  
  // Identify anti-patterns
  const antiPatterns = identifyAntiPatterns(component.filePath, content);
  
  // Calculate quality score (simplified)
  const qualityScore = calculateComponentQualityScore(size, complexity, coupling, cohesion);
  
  return {
    id: component.id,
    name: component.name,
    filePath: component.filePath,
    type: component.type,
    size,
    complexity,
    coupling,
    cohesion,
    architecturalDrifts,
    namingViolations,
    antiPatterns,
    qualityScore
  };
}

/**
 * Identify architectural drifts in a file
 */
function identifyArchitecturalDrifts(filePath: string, componentName: string, content: string): ArchitecturalDrift[] {
  const drifts: ArchitecturalDrift[] = [];
  
  // Check for common pattern violations
  if (content.includes('useState') && content.includes('useContext') && content.length > 500) {
    drifts.push({
      id: `drift-${Date.now()}-${Math.random()}`,
      componentName,
      filePath,
      deviationType: 'pattern-violation',
      description: 'Component mixes state management with UI logic',
      severity: 'medium',
      recommendation: 'Consider separating state management into a custom hook or store'
    });
  }
  
  // Check for boundary crossing
  if (content.includes('localStorage') && filePath.includes('/components/')) {
    drifts.push({
      id: `drift-${Date.now()}-${Math.random()}`,
      componentName,
      filePath,
      deviationType: 'boundary-crossing',
      description: 'UI component directly accesses localStorage',
      severity: 'high',
      recommendation: 'Move persistence logic to a service or store'
    });
  }
  
  return drifts;
}

/**
 * Identify naming violations
 */
function identifyNamingViolations(filePath: string, componentName: string): NamingViolation[] {
  const violations: NamingViolation[] = [];
  
  // Check for PascalCase naming convention
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
    violations.push({
      id: `violation-${Date.now()}-${Math.random()}`,
      filePath,
      entityName: componentName,
      violationType: 'convention-violation',
      expectedPattern: 'PascalCase',
      actualName: componentName
    });
  }
  
  return violations;
}

/**
 * Identify anti-patterns
 */
function identifyAntiPatterns(filePath: string, content: string): AntiPattern[] {
  const antiPatterns: AntiPattern[] = [];
  
  // Check for god component pattern (excessively large component)
  const linesOfCode = content.split('\n').length;
  if (linesOfCode > 500) {
    antiPatterns.push({
      id: `antipattern-${Date.now()}-${Math.random()}`,
      filePath,
      patternType: 'god-component',
      description: 'Component is excessively large and likely violates single responsibility principle',
      affectedEntities: ['component']
    });
  }
  
  return antiPatterns;
}

/**
 * Calculate module quality score
 */
function calculateModuleQualityScore(
  size: any,
  complexity: any,
  coupling: any,
  cohesion: any
): number {
  // Simplified quality calculation
  // In a real implementation, this would be much more sophisticated
  let score = 100;
  
  // Deduct points for large size
  if (size.linesOfCode > 300) score -= 10;
  if (size.linesOfCode > 500) score -= 20;
  
  // Deduct points for high complexity
  if (complexity.cyclomaticComplexity > 10) score -= 10;
  if (complexity.cyclomaticComplexity > 20) score -= 20;
  
  // Deduct points for high coupling
  if (coupling.directDependencies > 10) score -= 10;
  if (coupling.directDependencies > 20) score -= 20;
  
  // Deduct points for low cohesion
  if (cohesion.functionalCohesion < 0.5) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate component quality score
 */
function calculateComponentQualityScore(
  size: any,
  complexity: any,
  coupling: any,
  cohesion: any
): number {
  // Simplified quality calculation similar to module quality
  return calculateModuleQualityScore(size, complexity, coupling, cohesion);
}

/**
 * Calculate architectural debt estimate
 */
function calculateArchitecturalDebt(drifts: ArchitecturalDrift[]): number {
  let debt = 0;
  
  for (const drift of drifts) {
    switch (drift.severity) {
      case 'low':
        debt += 1;
        break;
      case 'medium':
        debt += 3;
        break;
      case 'high':
        debt += 8;
        break;
      case 'critical':
        debt += 20;
        break;
    }
  }
  
  return debt;
}