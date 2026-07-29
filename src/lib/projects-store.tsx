import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { projects as seedProjects, type Project } from "@/data/demo";

type Ctx = {
  projects: Project[];
  create: (p: Omit<Project, "id">) => void;
  update: (id: string, patch: Partial<Project>) => void;
  remove: (id: string) => void;
  archive: (id: string) => void;
  duplicate: (id: string) => void;
};

const ProjectsContext = createContext<Ctx | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects);

  const value = useMemo<Ctx>(
    () => ({
      projects,
      create: (p) => setProjects((prev) => [{ ...p, id: `p${Date.now()}` }, ...prev]),
      update: (id, patch) =>
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      remove: (id) => setProjects((prev) => prev.filter((p) => p.id !== id)),
      archive: (id) =>
        setProjects((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, archived: !p.archived, status: p.archived ? "In Progress" : "Archived" } : p,
          ),
        ),
      duplicate: (id) =>
        setProjects((prev) => {
          const source = prev.find((p) => p.id === id);
          if (!source) return prev;
          const copy: Project = { ...source, id: `p${Date.now()}`, name: `${source.name} (Copy)` };
          const index = prev.findIndex((p) => p.id === id);
          return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
        }),
    }),
    [projects],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used inside ProjectsProvider");
  return ctx;
}
