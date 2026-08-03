/**
 * Engineering Memory
 * Tracking engineering decisions and learning
 */

import { EngineeringMemoryRecord, EngineeringStage } from './types';

// Create a new engineering memory record
export function createEngineeringMemoryRecord(
  projectId: string,
  stage: EngineeringStage,
  decision: string,
  reason: string,
  repositoryEvidence: string,
  approval: boolean,
  confidence: number
): EngineeringMemoryRecord {
  return {
    id: `memory-${projectId}-${stage}-${Date.now()}`,
    projectId,
    stage,
    timestamp: new Date().toISOString(),
    decision,
    reason,
    repositoryEvidence,
    approval,
    confidence: Math.max(0, Math.min(100, confidence))
  };
}

// Find memory records for a specific project
export function findMemoryRecordsByProject(
  records: EngineeringMemoryRecord[],
  projectId: string
): EngineeringMemoryRecord[] {
  return records.filter(record => record.projectId === projectId);
}

// Find memory records for a specific stage
export function findMemoryRecordsByStage(
  records: EngineeringMemoryRecord[],
  stage: EngineeringStage
): EngineeringMemoryRecord[] {
  return records.filter(record => record.stage === stage);
}

// Find memory records by date range
export function findMemoryRecordsByDateRange(
  records: EngineeringMemoryRecord[],
  startDate: string,
  endDate: string
): EngineeringMemoryRecord[] {
  return records.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
  });
}

// Get average confidence for a project
export function getAverageConfidenceForProject(
  records: EngineeringMemoryRecord[],
  projectId: string
): number {
  const projectRecords = findMemoryRecordsByProject(records, projectId);
  if (projectRecords.length === 0) return 0;
  
  const totalConfidence = projectRecords.reduce((sum, record) => sum + record.confidence, 0);
  return Math.round(totalConfidence / projectRecords.length);
}

// Get approval rate for a project
export function getApprovalRateForProject(
  records: EngineeringMemoryRecord[],
  projectId: string
): number {
  const projectRecords = findMemoryRecordsByProject(records, projectId);
  if (projectRecords.length === 0) return 0;
  
  const approvedCount = projectRecords.filter(record => record.approval).length;
  return Math.round((approvedCount / projectRecords.length) * 100);
}