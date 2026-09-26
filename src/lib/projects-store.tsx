import { createContext, useContext, useMemo, type ReactNode } from "react";
import { toast } from "sonner";

// ... existing imports ...

const ProjectsContext = createContext<Ctx | null>(null);
export function ProjectsProvider({ children }: { children: ReactNode }) {
  // Use Supabase hook for data management
  const { projects, loading, error, createProject, updateProject, deleteProject, archiveProject, duplicateProject, refresh } = useSupabaseProjects();

  const value = useMemo<Ctx>(
    () => ({
      projects,
      create: async (p) => {
        try {
          const created = await createProject(p);
          toast.success("Project created");
          return created;
        } catch (err) {
          toast.error("Failed to create project: " + (err instanceof Error ? err.message : "Unknown error"));
          throw err;
        }
      },
      update: async (id, patch) => {
        try {
          await updateProject(id, patch);
          toast.success("Project updated");
        } catch (err) {
          toast.error("Failed to update project: " + (err instanceof Error ? err.message : "Unknown error"));
          throw err;
        }
      },
      remove: async (id) => {
        try {
          await deleteProject(id);
          toast.success("Project deleted");
        } catch (err) {
          toast.error("Failed to delete project: " + (err instanceof Error ? err.message : "Unknown error"));
          throw err;
        }
      },
      archive: async (id) => {
        try {
          await archiveProject(id);
          toast.success("Project archived");
        } catch (err) {
          toast.error("Failed to archive project: " + (err instanceof Error ? err.message : "Unknown error"));
          throw err;
        }
      },
      duplicate: async (id) => {
        try {
          await duplicateProject(id);
          toast.success("Project duplicated");
        } catch (err) {
          toast.error("Failed to duplicate project: " + (err instanceof Error ? err.message : "Unknown error"));
          throw err;
        }
      },
      loading,
      error,
      refresh
    }), [projects, loading, error, createProject, updateProject, deleteProject, archiveProject, duplicateProject, refresh]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used inside ProjectsProvider");
  return ctx;
}

