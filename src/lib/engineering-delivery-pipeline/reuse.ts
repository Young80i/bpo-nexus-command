/**
 * Reuse Analysis
 * Analyzing and documenting reuse decisions
 */

import { ReuseAnalysisRecord } from './types';

// Create a new reuse analysis record
export function createReuseAnalysisRecord(
  projectId: string,
  artifactType: ReuseAnalysisRecord['artifactType'],
  artifactName: string,
  filePath: string,
  reuseDecision: ReuseAnalysisRecord['reuseDecision'],
  reason: string,
  confidence: number
): ReuseAnalysisRecord {
  return {
    id: `reuse-${projectId}-${artifactType}-${artifactName}-${Date.now()}`,
    projectId,
    artifactType,
    artifactName,
    filePath,
    reuseDecision,
    reason,
    confidence: Math.max(0, Math.min(100, confidence)),
    analyzedAt: new Date().toISOString()
  };
}

// Find reuse records by project
export function findReuseRecordsByProject(
  records: ReuseAnalysisRecord[],
  projectId: string
): ReuseAnalysisRecord[] {
  return records.filter(record => record.projectId === projectId);
}

// Find reuse records by artifact type
export function findReuseRecordsByArtifactType(
  records: ReuseAnalysisRecord[],
  artifactType: ReuseAnalysisRecord['artifactType']
): ReuseAnalysisRecord[] {
  return records.filter(record => record.artifactType === artifactType);
}

// Get reuse statistics for a project
export function getReuseStatistics(
  records: ReuseAnalysisRecord[],
  projectId: string
): {
  totalArtifacts: number;
  reusedCount: number;
  extendedCount: number;
  createNewCount: number;
  reusePercentage: number;
} {
  const projectRecords = findReuseRecordsByProject(records, projectId);
  
  if (projectRecords.length === 0) {
    return {
      totalArtifacts: 0,
      reusedCount: 0,
      extendedCount: 0,
      createNewCount: 0,
      reusePercentage: 0
    };
  }
  
  const reusedCount = projectRecords.filter(r => r.reuseDecision === 'reuse').length;
  const extendedCount = projectRecords.filter(r => r.reuseDecision === 'extend').length;
  const createNewCount = projectRecords.filter(r => r.reuseDecision === 'create-new').length;
  
  return {
    totalArtifacts: projectRecords.length,
    reusedCount,
    extendedCount,
    createNewCount,
    reusePercentage: Math.round((reusedCount / projectRecords.length) * 100)
  };
}

// Get average confidence for reuse decisions
export function getAverageReuseConfidence(
  records: ReuseAnalysisRecord[],
  projectId: string
): number {
  const projectRecords = findReuseRecordsByProject(records, projectId);
  if (projectRecords.length === 0) return 0;
  
  const totalConfidence = projectRecords.reduce((sum, record) => sum + record.confidence, 0);
  return Math.round(totalConfidence / projectRecords.length);
}