import { createContext, useContext, useMemo, type ReactNode } from "react";
import { projects as seedProjects, type Project } from "@/data/demo";
import { useSupabaseProjects } from "@/lib/supabase/hooks/useSupabaseProjects";

type Ctx = {
  projects: Project[];
  create: (p: Omit<Project, "id">) => void;
  update: (id: string, patch: Partial<Project>) => void;
  remove: (id: string) => void;
  archive: (id: string) => void;
  duplicate: (id: string) => void;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

const ProjectsContext = createContext<Ctx | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  // Use Supabase hook for data management
  const { projects, loading, error, createProject, updateProject, deleteProject, archiveProject, duplicateProject, refresh } = useSupabaseProjects();

  const value = useMemo<Ctx>(
    () => ({
      projects,
      create: (p) => {
        createProject(p).catch(console.error);
      },
      update: (id, patch) => {
        updateProject(id, patch).catch(console.error);
      },
      remove: (id) => {
        deleteProject(id).catch(console.error);
      },
      archive: (id) => {
        archiveProject(id).catch(console.error);
      },
      duplicate: (id) => {
        duplicateProject(id).catch(console.error);
      },
      loading,
      error,
      refresh
    }),
    [projects, loading, error, createProject, updateProject, deleteProject, archiveProject, duplicateProject, refresh],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used inside ProjectsProvider");
  return ctx;
}
