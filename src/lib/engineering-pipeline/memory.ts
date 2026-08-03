/**
 * Engineering Delivery Pipeline
 * Engineering Memory Storage
 */

import type { EngineeringDecision, PipelineItem } from './types';

/**
 * Save engineering decisions to persistent storage
 * In a real implementation, this would use the persist utilities
 */
export function saveEngineeringDecisions(decisions: EngineeringDecision[]): void {
  try {
    // In a real implementation, this would use localStorage or a database
    // For now, we'll just log to console
    console.log('Saving engineering decisions:', decisions);
  } catch (error) {
    console.error('Failed to save engineering decisions:', error);
  }
}

/**
 * Load engineering decisions from persistent storage
 */
export function loadEngineeringDecisions(): EngineeringDecision[] {
  try {
    // In a real implementation, this would load from localStorage or a database
    // For now, we'll return an empty array
    return [];
  } catch (error) {
    console.error('Failed to load engineering decisions:', error);
    return [];
  }
}

/**
 * Get decisions for a specific pipeline item
 */
export function getDecisionsForItem(itemId: string, decisions: EngineeringDecision[]): EngineeringDecision[] {
  return decisions.filter(decision => decision.id.includes(itemId));
}

/**
 * Get decisions for a specific stage
 */
export function getDecisionsForStage(stage: string, decisions: EngineeringDecision[]): EngineeringDecision[] {
  return decisions.filter(decision => decision.stage === stage);
}

/**
 * Get all decisions sorted by timestamp
 */
export function getAllDecisionsSorted(decisions: EngineeringDecision[]): EngineeringDecision[] {
  return [...decisions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Export engineering memory for reporting
 */
export function exportEngineeringMemory(decisions: EngineeringDecision[]): string {
  // In a real implementation, this might export to CSV, JSON, or other formats
  return JSON.stringify(decisions, null, 2);
}

/**
 * Analyze engineering decisions for patterns
 */
export function analyzeDecisionPatterns(decisions: EngineeringDecision[]): Record<string, any> {
  // In a real implementation, this would perform analysis on decision patterns
  // For now, we'll return a simple summary
  
  const totalDecisions = decisions.length;
  const approvedDecisions = decisions.filter(d => d.approved).length;
  const averageConfidence = decisions.length > 0 
    ? decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length
    : 0;
  
  return {
    totalDecisions,
    approvedDecisions,
    approvalRate: totalDecisions > 0 ? (approvedDecisions / totalDecisions) * 100 : 0,
    averageConfidence: Math.round(averageConfidence),
    decisionsByStage: groupDecisionsByStage(decisions)
  };
}

/**
 * Group decisions by stage
 */
function groupDecisionsByStage(decisions: EngineeringDecision[]): Record<string, EngineeringDecision[]> {
  const grouped: Record<string, EngineeringDecision[]> = {};
  
  decisions.forEach(decision => {
    if (!grouped[decision.stage]) {
      grouped[decision.stage] = [];
    }
    grouped[decision.stage].push(decision);
  });
  
  return grouped;
}