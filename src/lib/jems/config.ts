/**
 * JARVIS Engineering Management System (JEMS)
 * Configuration Management
 */

import { CONSTITUTION_CONTINUE_DEVELOPMENT, CONSTITUTION_JARVIS_EXECUTIVE } from './constants';

// Constitution references
export const CONSTITUTIONS = {
  CONTINUE_DEVELOPMENT: {
    id: 'continue-dev-v2',
    name: CONSTITUTION_CONTINUE_DEVELOPMENT,
    version: '2.0',
    mandatory: true
  },
  JARVIS_EXECUTIVE: {
    id: 'jarvis-exec-v1',
    name: CONSTITUTION_JARVIS_EXECUTIVE,
    version: '1.0',
    mandatory: true
  }
} as const;

// Governance categories that must be supported
export const GOVERNANCE_CATEGORIES = {
  REPOSITORY_STANDARDS: 'Repository Standards',
  ARCHITECTURE_STANDARDS: 'Architecture Standards',
  PROMPT_STANDARDS: 'Prompt Standards',
  ENGINEERING_REVIEW_STANDARDS: 'Engineering Review Standards',
  RELEASE_CERTIFICATION_STANDARDS: 'Release Certification Standards'
} as const;

// File organization standards
export const FILE_ORGANIZATION = {
  ROOT_DIRECTORY: 'src/lib/jems/',
  CONFIG_FILES: 'src/lib/jems/config.ts',
  CONSTANTS_FILES: 'src/lib/jems/constants.ts',
  TYPES_FILES: 'src/lib/jems/types.ts',
  VERSIONING_FILES: 'src/lib/jems/versioning.ts'
} as const;

// Repository evidence requirements
export const REPOSITORY_EVIDENCE_REQUIREMENTS = [
  'folder structure',
  'routing',
  'components',
  'layouts',
  'stores',
  'contexts',
  'utilities',
  'services',
  'existing governance-related modules',
  'configuration files',
  'AI modules',
  'architecture',
  'repository conventions'
] as const;

// Implementation rules
export const IMPLEMENTATION_RULES = {
  JUSTIFIED_BY_REPOSITORY_EVIDENCE: 'justified by repository evidence',
  MINIMAL: 'minimal',
  REUSABLE: 'reusable',
  CONSTITUTION_COMPLIANT: 'constitution compliant',
  ARCHITECTURALLY_CONSISTENT: 'architecturally consistent'
} as const;

// Self verification checks
export const SELF_VERIFICATION_CHECKS = {
  IMPORTS: 'imports',
  EXPORTS: 'exports',
  FILE_NAMING: 'file naming',
  FOLDER_CONSISTENCY: 'folder consistency',
  REPOSITORY_CONVENTIONS: 'repository conventions',
  DUPLICATE_CODE: 'duplicate code',
  ARCHITECTURAL_DRIFT: 'architectural drift',
  UNNECESSARY_ABSTRACTIONS: 'unnecessary abstractions'
} as const;