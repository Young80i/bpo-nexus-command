/**
 * JARVIS Engineering Management System (JEMS)
 * Version 2 - Sprint 1: Governance Foundation
 */

// JEMS System Information
export const JEMS_SYSTEM_NAME = "JARVIS Engineering Management System";
export const JEMS_SYSTEM_ABBREVIATION = "JEMS";
export const JEMS_VERSION = "2.0.0";

// Sprint Information
export const CURRENT_SPRINT = "Sprint 1";
export const SPRINT_GOAL = "Governance Foundation";

// Constitutions
export const CONSTITUTION_CONTINUE_DEVELOPMENT = "Continue Development Constitution v2.0";
export const CONSTITUTION_JARVIS_EXECUTIVE = "JARVIS Executive Constitution v1.0";

// Roles
export const ROLE_ENGINEERING_AGENT = "Engineering Implementation Agent";
export const ROLE_JARVIS = "JARVIS (Executive Intelligence System)";
export const ROLE_CONTINUE = "Continue (Implementation Agent)";
export const ROLE_CEO = "CEO (Final Authority)";

// Governance Categories
export const GOVERNANCE_CATEGORIES = [
  "Repository Standards",
  "Architecture Standards", 
  "Prompt Standards",
  "Engineering Review Standards",
  "Release Certification Standards"
] as const;

// File Status
export const FILE_STATUS = {
  PROPOSED: "proposed",
  APPROVED: "approved",
  IMPLEMENTED: "implemented",
  ARCHIVED: "archived"
} as const;

// Constitution Compliance Status
export const CONSTITUTION_COMPLIANCE = {
  COMPLIANT: "compliant",
  NON_COMPLIANT: "non-compliant",
  PENDING_REVIEW: "pending-review"
} as const;