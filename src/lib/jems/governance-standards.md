# JARVIS Engineering Governance Standards

## Repository Standards

All JEMS modules must adhere to the established repository structure and conventions:

1. **Directory Structure**
   - All JEMS components reside in `src/lib/jems/`
   - Each major component has its own file
   - Related functionality is grouped appropriately

2. **File Naming**
   - Use kebab-case for file names
   - Descriptive names that clearly indicate purpose
   - Consistent with existing repository conventions

3. **Code Organization**
   - Export all public APIs through `index.ts`
   - Maintain clear separation of concerns
   - Follow established patterns in the repository

## Architecture Standards

1. **Modularity**
   - Components should be loosely coupled
   - Clear interfaces between modules
   - Minimal dependencies between components

2. **Extensibility**
   - Design for future expansion
   - Avoid hard-coded values where possible
   - Use configuration over code when appropriate

3. **Type Safety**
   - Comprehensive TypeScript typing
   - Strict null checking enabled
   - Avoid `any` type unless absolutely necessary

## Prompt Standards

1. **Clarity**
   - Clear, unambiguous instructions
   - Specific inputs and expected outputs
   - Context boundaries explicitly defined

2. **Consistency**
   - Follow established prompt patterns
   - Maintain consistent terminology
   - Standard formatting for all prompts

3. **Efficiency**
   - Minimize token usage where possible
   - Focus on essential information only
   - Avoid redundant or repetitive elements

## Engineering Review Standards

1. **Constitutional Compliance**
   - All code must comply with both governing constitutions
   - Non-compliance must be explicitly justified
   - Regular compliance audits required

2. **Code Quality**
   - Adherence to established coding standards
   - Proper error handling and edge case consideration
   - Adequate test coverage for critical functionality

3. **Documentation**
   - All public APIs must be documented
   - Complex logic requires inline comments
   - README updates for significant changes

## Release Certification Standards

1. **Version Management**
   - Semantic versioning must be followed
   - Breaking changes require major version bump
   - All releases must be tagged appropriately

2. **Testing**
   - All critical paths must be tested
   - Regression testing for bug fixes
   - Performance benchmarks for optimizations

3. **Deployment**
   - Clear release notes for each version
   - Backward compatibility maintained for minor versions
   - Rollback procedures documented