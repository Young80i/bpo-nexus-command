/**
 * JARVIS Engineering Management System (JEMS)
 * Types for Governance Foundation
 */

export type Constitution = {
  id: string;
  name: string;
  version: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'deprecated' | 'draft';
};

export type GovernanceStandard = {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  constitutionCompliance: 'compliant' | 'non-compliant' | 'pending-review';
  repositoryEvidence: string;
  justification: string;
};

export type GovernanceFile = {
  id: string;
  name: string;
  path: string;
  category: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  status: 'proposed' | 'approved' | 'implemented' | 'archived';
  constitutionCompliance: 'compliant' | 'non-compliant' | 'pending-review';
  reuseAnalysis: {
    existingArtifact: string;
    reuseSuitability: 'high' | 'medium' | 'low';
    extensionSuitability: 'high' | 'medium' | 'low';
    reason: string;
  };
};

export type VersionInfo = {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
};

export type RepositoryInspection = {
  folderStructure: string[];
  routing: string[];
  components: string[];
  layouts: string[];
  stores: string[];
  contexts: string[];
  utilities: string[];
  services: string[];
  governanceModules: string[];
  configurationFiles: string[];
  aiModules: string[];
  architecture: string[];
  repositoryConventions: string[];
};

export type ImplementationRule = {
  id: string;
  rule: string;
  justification: string;
  repositoryEvidence: string;
};

export type SelfVerificationResult = {
  id: string;
  check: string;
  passed: boolean;
  details: string;
};

export type LeadEngineerReview = {
  id: string;
  reviewQuestion: string;
  finding: string;
  recommendation: string;
  approved: boolean;
};