import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  Code2,
  FileText,
  Film,
  Gamepad2,
  Image as ImageIcon,
  Search,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { projects, clients } from "@/data/demo";
import { milestones } from "@/data/workspace";
import { fileKinds, vaultFiles, type FileKind, type VaultFile } from "@/data/files";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "File Vault — Client & Project Documents | BPO Nexus" },
      {
        name: "description",
        content:
          "Central vault for images, videos, documents, PDFs, ZIPs, source code and game assets organised by client, project and milestone.",
      },
      { property: "og:title", content: "File Vault — BPO Nexus" },
      { property: "og:description", content: "Search, preview and organise every project deliverable in one vault." },
    ],
  }),
  component: FilesPage,
});

const kindIcon: Record<FileKind, typeof FileText> = {
  Image: ImageIcon,
  Video: Film,
  Document: FileText,
  PDF: FileText,
  ZIP: Archive,
  "Source Code": Code2,
  "Game Asset": Gamepad2,
};

const kindTone: Record<FileKind, string> = {
  Image: "bg-info/12 text-info",
  Video: "bg-primary/12 text-primary",
  Document: "bg-surface-2 text-muted-foreground",
  PDF: "bg-destructive/12 text-destructive",
  ZIP: "bg-warning/15 text-warning",
  "Source Code": "bg-success/12 text-success",
  "Game Asset": "bg-primary/12 text-primary",
};

type GroupBy = "client" | "project" | "milestone";

function FilesPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | FileKind>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("project");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      vaultFiles.filter((f) => {
        const q = query.trim().toLowerCase();
        const matches = !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
        return matches && (kind === "all" || f.kind === kind);
      }),
    [query, kind],
  );

  const groups = useMemo(() => {
    const map = new Map<string, VaultFile[]>();
    for (const f of filtered) {
      const key =
        groupBy === "client"
          ? (clients.find((c) => c.id === f.clientId)?.company ?? "Unassigned client")
          : groupBy === "project"
            ? (projects.find((p) => p.id === f.projectId)?.name ?? "Unassigned project")
            : (milestones.find((m) => m.id === f.milestoneId)?.title ?? "No milestone");
      map.set(key, [...(map.get(key) ?? []), f]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, groupBy]);

  const open = vaultFiles.find((f) => f.id === openId) ?? null;
  const totalSize = filtered.length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="File Vault"
        description={`${totalSize} files across images, video, documents, code and game assets`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files…"
                className="h-9 w-52 rounded-lg border border-input bg-background pl-8 pr-3 text-sm"
              />
            </div>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="client">Group by client</option>
              <option value="project">Group by project</option>
              <option value="milestone">Group by milestone</option>
            </select>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {(["all", ...fileKinds] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              kind === k ? "border-primary/40 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {k === "all" ? "All types" : k}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {groups.map(([label, items]) => (
          <section key={label}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-semibold">{label}</h2>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground">
                {items.length}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((f) => {
                const Icon = kindIcon[f.kind];
                return (
                  <button
                    key={f.id}
                    onClick={() => setOpenId(f.id)}
                    className="surface-card lift p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", kindTone[f.kind])}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{f.name}</p>
                        <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                          {f.kind} · {f.size}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{f.description}</p>
                    <p className="mt-3 text-[0.68rem] text-muted-foreground">
                      {f.uploadedBy} · {f.uploaded}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="surface-card p-10 text-center text-sm text-muted-foreground">No files match your search.</p>
        )}
      </div>

      {open && <FilePreview file={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function FilePreview({ file, onClose }: { file: VaultFile; onClose: () => void }) {
  const Icon = kindIcon[file.kind];
  const client = clients.find((c) => c.id === file.clientId);
  const project = projects.find((p) => p.id === file.projectId);
  const milestone = milestones.find((m) => m.id === file.milestoneId);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", kindTone[file.kind])}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold">{file.name}</h2>
              <p className="text-xs text-muted-foreground">
                {file.kind} · {file.size} · uploaded {file.uploaded} by {file.uploadedBy}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface-2">
          {file.preview === "image" ? (
            <div className="grid h-56 place-items-center brand-gradient text-primary-foreground">
              <ImageIcon className="h-10 w-10 opacity-80" />
            </div>
          ) : file.preview === "video" ? (
            <div className="grid h-56 place-items-center bg-foreground/90 text-background">
              <Film className="h-10 w-10 opacity-80" />
            </div>
          ) : file.preview ? (
            <pre className="scrollbar-thin max-h-56 overflow-auto p-4 text-[0.72rem] leading-relaxed">{file.preview}</pre>
          ) : (
            <div className="grid h-40 place-items-center text-xs text-muted-foreground">
              No inline preview for {file.kind} files
            </div>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{file.description}</p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Client", value: client?.company ?? "—" },
            { label: "Project", value: project?.name ?? "—" },
            { label: "Milestone", value: milestone?.title ?? "Unlinked" },
          ].map((row) => (
            <div key={row.label} className="rounded-lg border border-border bg-surface-2 p-3">
              <dt className="text-[0.7rem] text-muted-foreground">{row.label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
