# Sprint 2 – Repository Inspection Implementation Plan

Based on the repository inspection, here is the implementation plan for Sprint 2:

## Files to Modify

1. **State Management Migration**
   - `src/lib/workspace-store.tsx` - Migrate from localStorage to Supabase
   - `src/lib/automation-store.tsx` - Migrate from localStorage to Supabase
   - `src/lib/files-store.tsx` - Complete Supabase implementation (currently uses localStorage fallback)
   - `src/lib/profile-store.tsx` - Already migrated, verify completeness

2. **Supabase Enhancements**
   - `src/lib/supabase/repositories.ts` - Add repositories for new entities (workspaces, automations, files)
   - `src/lib/supabase/services.ts` - Add service methods for new entities
   - `src/lib/supabase/types.ts` - Add TypeScript types for new tables
   - `src/lib/supabase/migrations/` - Add migration scripts for new tables

3. **Real-time Features**
   - `src/lib/supabase/hooks/useSupabaseProjects.ts` - Add real-time subscription
   - `src/lib/supabase/hooks/useSupabaseClients.ts` - Add real-time subscription
   - Similar updates for other Supabase hooks

4. **UI Components**
   - Enhance existing components to handle loading/error states from Supabase
   - Add optimistic updates where appropriate

## Existing Code to Reuse

1. **Routing System** - TanStack Router file-based routing (no changes needed)
2. **Authentication** - Supabase auth system in `src/lib/supabase/hooks/useAuth.ts`
3. **Supabase Client** - `src/lib/supabase/client.ts`
4. **Repository Pattern** - Existing pattern in `src/lib/supabase/repositories.ts`
5. **Service Layer** - Existing pattern in `src/lib/supabase/services.ts`
6. **State Management** - Context + Provider pattern in existing *-store.tsx files
7. **UI Components** - shadcn/ui components in `src/components/ui/`
8. **Persistence Mechanism** - `src/lib/persist.ts` (for migration reference)
9. **Type Definitions** - `src/lib/supabase/types.ts`
10. **Migration System** - Existing SQL migrations

## Risks

1. **Data Migration Complexity** - Migrating existing localStorage data to Supabase
2. **Real-time Subscription Management** - Proper cleanup of subscriptions to prevent memory leaks
3. **Offline Capability Loss** - Current localStorage provides offline functionality
4. **Type Safety** - Ensuring TypeScript types match database schema
5. **Backend Dependency** - Application now requires Supabase connection to function
6. **Row Level Security** - Need to configure proper RLS policies for security
7. **Migration Scripts** - Ensuring migrations are backward compatible

## Order of Implementation

1. **Week 1: Workspace Migration**
   - Define Supabase schema for workspace entities (milestones, conversations, messages, prompts, tracks)
   - Create migration scripts for new tables
   - Implement repositories for workspace entities
   - Implement service methods for workspace entities
   - Migrate workspace-store to use Supabase with localStorage fallback
   - Add real-time subscriptions to workspace hooks

2. **Week 2: Automation & Files Migration**
   - Define Supabase schema for automation and file entities
   - Create migration scripts for new tables
   - Implement repositories for automation and file entities
   - Implement service methods for automation and file entities
   - Migrate automation-store to use Supabase
   - Complete files-store migration to Supabase (remove localStorage fallback)
   - Add real-time subscriptions where appropriate

3. **Week 3: Real-time Features & Optimization**
   - Add real-time subscriptions to all Supabase hooks
   - Implement optimistic UI updates for better UX
   - Add proper error handling and loading states
   - Optimize database queries and add missing indexes
   - Test offline behavior and error recovery

4. **Week 4: Validation & Polishing**
   - Verify all existing functionality still works
   - Test data migration from localStorage to Supabase
   - Performance testing and optimization
   - Security audit of RLS policies
   - Documentation updates

## Validation Steps

1. **Unit Testing**
   - Test Supabase repository methods with mock data
   - Test service layer logic
   - Test store migration logic

2. **Integration Testing**
   - Verify data flows from UI → Supabase → UI
   - Test real-time updates between multiple clients
   - Test error scenarios (network failure, auth issues)

3. **User Acceptance Testing**
   - Verify all existing features work with Supabase backend
   - Test data persistence across sessions
   - Test real-time collaboration features
   - Verify offline behavior gracefully degrades

4. **Performance Testing**
   - Measure query response times
   - Test real-time subscription overhead
   - Verify proper cleanup of subscriptions
   - Bundle size impact analysis

5. **Security Testing**
   - Verify RLS policies prevent unauthorized access
   - Test authentication flow protection
   - Validate data validation on backend
   - Check for SQL injection vulnerabilities

6. **Migration Testing**
   - Test migration scripts on copy of production database
   - Verify data integrity after migration
   - Test rollback scenarios
   - Verify localStorage to Supabase data migration

## Definition of Done

1. All stores migrated to use Supabase as primary data source
2. Real-time subscriptions implemented for collaborative features
3. Proper error handling and loading states in all components
4. Data migration scripts created and tested
5. RLS policies configured for all tables
6. All existing functionality preserved and working
7. Performance benchmarks met or exceeded
8. Documentation updated for new architecture
9. No regression in existing features
10. Type safety maintained throughout