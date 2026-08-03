# JARVIS Engineering Management System (JEMS)

## Overview

JEMS (JARVIS Engineering Management System) is the governance foundation for all JARVIS engineering modules. This system ensures constitutional compliance, architectural consistency, and maintainable engineering practices across all JARVIS-enabled systems.

## Components

### Constants (`constants.ts`)
Centralized constants and version definitions for the JEMS system.

### Configuration (`config.ts`)
Configuration management including constitution references, governance categories, and implementation rules.

### Types (`types.ts`)
TypeScript definitions for all governance entities including constitutions, standards, and verification mechanisms.

### Versioning (`versioning.ts`)
Utilities for semantic version management, comparison, and validation.

## Governance Structure

JEMS is governed by two mandatory constitutions:
1. Continue Development Constitution v2.0
2. JARVIS Executive Constitution v1.0

All engineering implementations must comply with both constitutions.

## Usage

```typescript
import { JEMS_VERSION, CONSTITUTIONS } from '@/lib/jems';

// Access system information
console.log(`Running JEMS version: ${JEMS_VERSION}`);

// Reference constitutions
console.log(`Required constitutions:`, CONSTITUTIONS);
```

## Standards Covered

- Repository Standards
- Architecture Standards
- Prompt Standards
- Engineering Review Standards
- Release Certification Standards

## Version Management

JEMS follows semantic versioning (SemVer) for all components:
- MAJOR version for incompatible changes
- MINOR version for backward compatible additions
- PATCH version for backward compatible bug fixes