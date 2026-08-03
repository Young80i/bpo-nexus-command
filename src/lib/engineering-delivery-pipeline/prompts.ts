/**
 * Prompt Orchestration
 * Managing platform-specific prompts
 */

import { PromptOrchestration, Platform } from './types';

// Create a new prompt orchestration record
export function createPromptOrchestration(
  projectId: string,
  platform: Platform,
  promptContent: string
): PromptOrchestration {
  return {
    id: `prompt-${projectId}-${platform}-${Date.now()}`,
    projectId,
    platform,
    promptContent,
    generatedAt: new Date().toISOString(),
    executedAt: null,
    result: null,
    success: false
  };
}

// Mark prompt as executed
export function markPromptAsExecuted(
  prompt: PromptOrchestration,
  result: string,
  success: boolean
): PromptOrchestration {
  return {
    ...prompt,
    executedAt: new Date().toISOString(),
    result,
    success
  };
}

// Find prompts by project
export function findPromptsByProject(
  prompts: PromptOrchestration[],
  projectId: string
): PromptOrchestration[] {
  return prompts.filter(prompt => prompt.projectId === projectId);
}

// Find prompts by platform
export function findPromptsByPlatform(
  prompts: PromptOrchestration[],
  platform: Platform
): PromptOrchestration[] {
  return prompts.filter(prompt => prompt.platform === platform);
}

// Get success rate for a project
export function getPromptSuccessRate(
  prompts: PromptOrchestration[],
  projectId: string
): number {
  const projectPrompts = findPromptsByProject(prompts, projectId);
  if (projectPrompts.length === 0) return 0;
  
  const successfulPrompts = projectPrompts.filter(prompt => prompt.success).length;
  return Math.round((successfulPrompts / projectPrompts.length) * 100);
}

// Generate Lovable prompt template
export function generateLovablePromptTemplate(
  projectName: string,
  features: string[],
  uiRequirements: string[]
): string {
  return `# Lovable Application Development Prompt

## Project: ${projectName}

## Features to Implement:
${features.map(feature => `- ${feature}`).join('\n')}

## UI Requirements:
${uiRequirements.map(req => `- ${req}`).join('\n')}

## Instructions:
1. Create a new application in Lovable
2. Implement the features listed above
3. Follow the UI requirements for design consistency
4. Ensure all components are properly structured
5. Document any assumptions made during development

## Constraints:
- Use TypeScript
- Follow best practices for React components
- Ensure responsive design
- Maintain clean, readable code
`;
}

// Generate Continue prompt template
export function generateContinuePromptTemplate(
  projectName: string,
  implementationDetails: string[],
  architectureGuidelines: string[]
): string {
  return `# Continue Implementation Prompt

## Project: ${projectName}

## Implementation Details:
${implementationDetails.map(detail => `- ${detail}`).join('\n')}

## Architecture Guidelines:
${architectureGuidelines.map(guideline => `- ${guideline}`).join('\n')}

## Instructions:
1. Analyze the repository structure
2. Implement the features according to the specifications
3. Follow the architecture guidelines
4. Ensure code quality and consistency
5. Write appropriate tests
6. Document implementation decisions

## Constraints:
- Follow existing code patterns in the repository
- Maintain TypeScript type safety
- Ensure proper error handling
- Write clean, maintainable code
- Comply with JEMS governance standards
`;
}