import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { ProgressBar } from "@/components/badges";
import { useProjects } from "@/lib/projects-store";
import { useWorkspace } from "@/lib/workspace-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/website")({
  head: () => ({
    meta: [
      { title: "Website Development — Stage Timeline | BPO Nexus" },
      {
        name: "description",
        content:
          "Track website builds across planning, design, frontend, backend, auth, database, API, testing, deployment and client revision.",
      },
      { property: "og:title", content: "Website Development — BPO Nexus" },
      { property: "og:description", content: "A visual delivery timeline with per-stage progress." },
    ],
  }),
  component: WebsitePage,
});

function WebsitePage() {
  const { projects } = useProjects();
  const { tracks, setStageProgress } = useWorkspace();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const project = projects.find((p) => p.id === projectId) ?? projects[0];
  const stages = tracks[project?.id ?? ""] ?? [];
  const overall = stages.length
    ? Math.round(stages.reduce((s, x) => s + x.progress, 0) / stages.length)
    : 0;

  if (!project) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Website Development"
        description="Stage-by-stage build progress with a visual delivery timeline"
        actions={
          <select
            value={project.id}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        }
      />

      <section className="surface-card mb-6 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Build completion
            </p>
            <p className="mt-1 font-display text-xl font-bold">{project.name}</p>
          </div>
          <p className="font-display text-3xl font-bold">{overall}%</p>
        </div>
        <ProgressBar value={overall} className="mt-4 h-2" />
        <div className="mt-5 flex gap-1.5 overflow-hidden rounded-full">
          {stages.map((s) => (
            <div
              key={s.stage}
              title={`${s.stage} — ${s.progress}%`}
              className={cn(
                "h-2 flex-1 rounded-full",
                s.progress === 100
                  ? "bg-success"
                  : s.progress > 0
                    ? "bg-primary/60"
                    : "bg-surface-2",
              )}
            />
          ))}
        </div>
      </section>

      <ol className="relative space-y-4 border-l border-border pl-8">
        {stages.map((s) => {
          const done = s.progress === 100;
          const active = s.progress > 0 && !done;
          return (
            <li key={s.stage} className="relative">
              <span
                className={cn(
                  "absolute -left-[2.35rem] top-4 grid h-6 w-6 place-items-center rounded-full border bg-background",
                  done
                    ? "border-success text-success"
                    : active
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <div className="surface-card p-4 lift">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold">{s.stage}</p>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.66rem] text-muted-foreground">
                    {s.owner}
                  </span>
                  <span
                    className={cn(
                      "ml-auto font-display text-sm font-bold",
                      done ? "text-success" : active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {s.progress}%
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
                <ProgressBar value={s.progress} className="mt-3" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={s.progress}
                  onChange={(e) => setStageProgress(project.id, s.stage, Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
