# Continue Development Constitution v2.0

## Overview

This document establishes the engineering development rules governing the BPO Nexus repository. All engineering activities must comply with these principles to ensure consistency, quality, and maintainability.

## Core Principles

### 1. Repository Evidence-Based Implementation
All engineering decisions must be justified by repository evidence. Implementation should never be speculative or based on assumptions about future needs.

### 2. Minimal and Reusable Approach
Every implementation should be:
- Minimal: Only implement what is necessary
- Reusable: Designed for reuse where possible
- Constitution Compliant: Follow established governance standards
- Architecturally Consistent: Maintain consistency with existing patterns

### 3. Architectural Consistency
All new implementations must maintain consistency with existing architectural patterns in the repository:
- File-based routing conventions
- State management patterns using `*-store.tsx` files
- Utility function consolidation in `src/lib/`
- Component organization in `src/components/`

## Implementation Rules

### 1. Pre-Implementation Verification
Before modifying anything, verify:
- Governance Foundation compliance
- Repository Intelligence evidence
- Architecture Intelligence consistency
- All required dependencies exist

If anything is missing, STOP and provide repository evidence with the smallest repository-consistent correction.

### 2. File Organization
- Follow existing folder structure conventions
- Use consistent naming patterns
- Place files in appropriate directories based on their function
- Maintain clear separation of concerns

### 3. Code Quality Standards
- Follow TypeScript best practices
- Maintain strong typing throughout
- Write clear, self-documenting code
- Include appropriate comments for complex logic
- Ensure proper error handling

### 4. Documentation Requirements
- All public APIs must be documented
- Complex logic requires inline comments
- New features require README documentation
- Changes must be reflected in governance documentation

## Repository Conventions

### 1. Library Organization
Utilities and system libraries belong in `src/lib/`:
- State management in `*-store.tsx` files
- Utility functions in `*.ts` files
- System configurations in appropriately named files

### 2. Component Organization
UI components belong in `src/components/`:
- Shared components in appropriate subdirectories
- Business logic components organized by feature
- Reusable elements properly exported

### 3. Routing Conventions
Routes are defined by files in `src/routes/`:
- File-based routing following TanStack Router patterns
- Route parameters using `$` prefix
- Layout components using `__` prefix

## Governance Compliance

### 1. JEMS Integration
All implementations must integrate with the JARVIS Engineering Management System:
- Follow governance standards documentation
- Maintain constitution compliance
- Use version management utilities
- Adhere to repository evidence requirements

### 2. Intelligence Engine Compatibility
Implementations should enhance existing intelligence engines:
- Repository Intelligence Engine
- Architecture Intelligence Engine
- Engineering Delivery Pipeline

## Change Management

### 1. Version Control
- All changes must be committed with clear, descriptive messages
- Follow semantic versioning principles
- Maintain clean git history
- Avoid force pushing or rebasing published commits

### 2. Review Process
- All significant changes require review
- Engineering decisions must be recorded in Engineering Memory
- Risk assessment should be performed for complex changes
- Architecture drift must be avoided

## Conflict Resolution

When repository evidence contradicts implementation requests:
1. STOP implementation
2. Provide repository evidence
3. Recommend the smallest repository-consistent correction
4. Wait for CEO approval before proceeding

## Future Enhancements

This constitution may be updated to reflect evolving repository needs. All updates must maintain backward compatibility and continue to follow repository evidence-based principles.