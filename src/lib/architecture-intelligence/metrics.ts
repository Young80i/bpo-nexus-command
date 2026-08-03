/**
 * Architecture Intelligence Engine
 * Metric Calculation Functions
 */

import type {
  SizeMetric,
  ComplexityMetric,
  CouplingMetric,
  CohesionMetric
} from './types';

/**
 * Calculate size metrics for a module or component
 * In a real implementation, this would analyze the actual file content
 */
export function calculateSizeMetrics(filePath: string, content: string): SizeMetric {
  // Placeholder implementation
  const lines = content.split('\n');
  const linesOfCode = lines.filter(line => line.trim() !== '').length;
  const fileSize = Buffer.byteLength(content, 'utf8');
  const componentCount = (content.match(/export (const|function|class)/g) || []).length;
  const exportCount = (content.match(/export /g) || []).length;
  
  return {
    linesOfCode,
    fileSize,
    componentCount,
    exportCount
  };
}

/**
 * Calculate complexity metrics
 * In a real implementation, this would analyze the actual code structure
 */
export function calculateComplexityMetrics(filePath: string, content: string): ComplexityMetric {
  // Placeholder implementation
  const functionCount = (content.match(/function |const .*=\s*\(|class /g) || []).length;
  const hookUsage = (content.match(/use[A-Z][a-zA-Z]*\s*\(/g) || []).length;
  const nestingDepth = calculateMaxNestingDepth(content);
  const cyclomaticComplexity = calculateCyclomaticComplexity(content);
  
  return {
    cyclomaticComplexity,
    nestingDepth,
    functionCount,
    hookUsage
  };
}

/**
 * Calculate coupling metrics
 * In a real implementation, this would analyze import statements
 */
export function calculateCouplingMetrics(filePath: string, content: string): CouplingMetric {
  // Placeholder implementation
  const imports = (content.match(/import .* from /g) || []).length;
  const exports = (content.match(/export /g) || []).length;
  
  return {
    directDependencies: imports,
    transitiveDependencies: Math.floor(imports * 0.3), // Estimate
    dependencyTypes: {
      'local': Math.floor(imports * 0.6),
      'external': Math.floor(imports * 0.3),
      'relative': Math.floor(imports * 0.1)
    },
    fanIn: exports,
    fanOut: imports
  };
}

/**
 * Calculate cohesion metrics
 * In a real implementation, this would analyze functional relationships
 */
export function calculateCohesionMetrics(filePath: string, content: string): CohesionMetric {
  // Placeholder implementation - in a real system this would be much more sophisticated
  return {
    functionalCohesion: 0.7, // Estimate based on single-responsibility principle
    communicationalCohesion: 0.6, // Estimate based on data flow
    sequentialCohesion: 0.5 // Estimate based on execution order
  };
}

/**
 * Calculate maximum nesting depth in the code
 */
function calculateMaxNestingDepth(content: string): number {
  // Simplified implementation
  const controlStructures = ['if', 'for', 'while', 'switch', 'try'];
  let maxDepth = 0;
  let currentDepth = 0;
  
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Increase depth for opening control structures
    if (controlStructures.some(cs => trimmedLine.startsWith(cs + '(') || trimmedLine.startsWith(cs + ' '))) {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
    
    // Decrease depth for closing braces
    if (trimmedLine.startsWith('}')) {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }
  
  return maxDepth;
}

/**
 * Calculate cyclomatic complexity
 */
function calculateCyclomaticComplexity(content: string): number {
  // Simplified implementation counting decision points
  const decisionPoints = ['if', 'for', 'while', 'case', 'catch', '&&', '||', '?'];
  let complexity = 1; // Base complexity
  
  for (const point of decisionPoints) {
    const regex = new RegExp(point, 'g');
    const matches = content.match(regex);
    complexity += matches ? matches.length : 0;
  }
  
  return complexity;
}