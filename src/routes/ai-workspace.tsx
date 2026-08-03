import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, History, Plus, Search, Code2 } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/projects-store";
import { useWorkspace } from "@/lib/workspace-store";
import { promptTools, type PromptTool } from "@/data/workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-workspace")({
  head: () => ({
        meta: [
      { title: "JARVIS Workspace — Prompt Library & Versions | BPO Nexus" },
      {
        name: "description",
        content:
          "Store Claude, Lovable and Base44 prompts per project with groups, versions, generated code notes and one-click copy.",
      },
      { property: "og:title", content: "JARVIS Workspace — BPO Nexus" },
      { property: "og:description", content: "Grouped prompt library with version history and code notes." },
    ],
  }),
  component: AiWorkspacePage,
});

const toolTone: Record<PromptTool, string> = {
  Claude: "bg-warning/15 text-warning border-warning/30",
  Lovable: "bg-primary/12 text-primary border-primary/25",
  Base44: "bg-info/12 text-info border-info/25",
};

function AiWorkspacePage() {
  const { projects } = useProjects();
  const { prompts, addPrompt } = useWorkspace();
  const [projectId, setProjectId] = useState("all");
  const [tool, setTool] = useState<"All" | PromptTool>("All");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      prompts.filter(
        (p) =>
          (projectId === "all" || p.projectId === projectId) &&
          (tool === "All" || p.tool === tool) &&
          (!query ||
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.body.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.includes(query.toLowerCase()))),
      ),
    [prompts, projectId, tool, query],
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((p) => map.set(p.group, [...(map.get(p.group) ?? []), p]));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  return (
    <div className="animate-fade-in">
            <PageHeader
        title="JARVIS Workspace"
        description="Prompt library, versions and generated code notes for every engagement"
        actions={
          <Button
            onClick={() =>
              addPrompt({
                projectId: projectId === "all" ? projects[0].id : projectId,
                title: "Untitled prompt",
                tool: tool === "All" ? "Claude" : tool,
                group: "Drafts",
                tags: ["draft"],
                body: "Describe the task, constraints and expected output format…",
                codeNotes: "",
                versions: [{ version: "v1", body: "Initial draft.", date: "2026-07-29", note: "Current" }],
                updated: "2026-07-29",
              })
            }
          >
            <Plus className="h-4 w-4" /> New prompt
          </Button>
        }
      />

      <div className="surface-card mb-6 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts, tags or content"
            className="pl-9"
          />
        </div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-1 p-1">
          {(["All", ...promptTools] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                tool === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {groups.map(([group, items]) => (
          <section key={group}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {group}
              </h2>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground">
                {items.length}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((p) => {
                const open = openId === p.id;
                return (
                  <article key={p.id} className="surface-card p-4 lift">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.title}</p>
                        <p className="mt-0.5 truncate text-[0.7rem] text-muted-foreground">
                          {projects.find((x) => x.id === p.projectId)?.name} · updated {p.updated}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold",
                          toolTone[p.tool],
                        )}
                      >
                        {p.tool}
                      </span>
                    </div>

                    <pre className="scrollbar-thin mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg border border-border/70 bg-surface-1 p-3 text-xs leading-relaxed text-muted-foreground">
                      {p.body}
                    </pre>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.66rem] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="ml-auto h-7 text-xs"
                        onClick={() => copy(p.id, p.body)}
                      >
                        {copied === p.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied === p.id ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setOpenId(open ? null : p.id)}
                      >
                        <History className="h-3.5 w-3.5" /> {p.versions.length} versions
                      </Button>
                    </div>

                    {open && (
                      <div className="mt-3 space-y-3 border-t border-border/70 pt-3">
                        <div>
                          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                            <Code2 className="h-3.5 w-3.5 text-primary" /> Generated code notes
                          </p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {p.codeNotes || "No notes recorded yet."}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1.5 text-xs font-semibold">Revision history</p>
                          <ol className="space-y-2 border-l border-border pl-4">
                            {p.versions.map((v) => (
                              <li key={v.version} className="relative text-xs">
                                <span className="absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full brand-gradient" />
                                <span className="font-semibold">{v.version}</span>
                                <span className="ml-2 text-muted-foreground">{v.date}</span>
                                <span className="ml-2 rounded-full bg-surface-2 px-1.5 py-0.5 text-[0.62rem] text-muted-foreground">
                                  {v.note}
                                </span>
                                <p className="mt-0.5 text-muted-foreground">{v.body}</p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
        {!groups.length && (
          <p className="surface-card p-10 text-center text-sm text-muted-foreground">
            No prompts match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
