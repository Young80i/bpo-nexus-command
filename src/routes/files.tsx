import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  Code2,
  Database,
  Download,
  FileAudio,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Film,
  Gamepad2,
  Image as ImageIcon,
  Pencil,
  Presentation,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useProjects } from "@/lib/projects-store";
import { useClients } from "@/lib/clients-store";
import { useWorkspace } from "@/lib/workspace-store";
import { useFiles, readUpload } from "@/lib/files-store";
import { fileKinds, type FileKind, type VaultFile } from "@/data/files";
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
  Audio: FileAudio,
  Document: FileText,
  PDF: FileText,
  Spreadsheet: FileSpreadsheet,
  Presentation: Presentation,
  ZIP: Archive,
  "Source Code": Code2,
  "Game Asset": Gamepad2,
  Data: Database,
  Other: FileIcon,
};

const kindTone: Record<FileKind, string> = {
  Image: "bg-info/12 text-info",
  Video: "bg-primary/12 text-primary",
  Audio: "bg-info/12 text-info",
  Document: "bg-surface-2 text-muted-foreground",
  PDF: "bg-destructive/12 text-destructive",
  Spreadsheet: "bg-success/12 text-success",
  Presentation: "bg-warning/15 text-warning",
  ZIP: "bg-warning/15 text-warning",
  "Source Code": "bg-success/12 text-success",
  "Game Asset": "bg-primary/12 text-primary",
  Data: "bg-info/12 text-info",
  Other: "bg-surface-2 text-muted-foreground",
};

type GroupBy = "client" | "project" | "milestone";

function FilesPage() {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { milestones } = useWorkspace();
  const { files, add, update, remove } = useFiles();
  const { confirm, element: confirmEl } = useConfirm();

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | FileKind>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("project");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<VaultFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      files.filter((f) => {
        const q = query.trim().toLowerCase();
        const matches = !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
        return matches && (kind === "all" || f.kind === kind);
      }),
    [files, query, kind],
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
  }, [filtered, groupBy, clients, projects, milestones]);

  const open = files.find((f) => f.id === openId) ?? null;

  const handleUpload = async (list: FileList | null) => {
    if (!list?.length) return;
    setUploading(true);
    const fallback = projects[0];
    try {
      for (const file of Array.from(list)) {
        const draft = await readUpload(file);
        add({
          ...draft,
          clientId: fallback?.clientId ?? "",
          projectId: fallback?.id ?? "",
          milestoneId: null,
          description: `Uploaded from ${file.name}`,
        });
      }
      toast.success(`${list.length} file${list.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const download = (f: VaultFile) => {
    if (f.dataUrl) {
      const a = document.createElement("a");
      a.href = f.dataUrl;
      a.download = f.name;
      a.click();
      toast.success(`Downloading ${f.name}`);
      return;
    }
    if (f.preview && f.preview !== "image" && f.preview !== "video" && f.preview !== "audio") {
      const blob = new Blob([f.preview], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloading ${f.name}`);
      return;
    }
    toast.info("This demo record has no stored binary to download.");
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="File Vault"
        description={`${filtered.length} files across images, video, documents, code and game assets`}
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
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <Button size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Add file"}
            </Button>
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
                  <div key={f.id} className="surface-card lift group relative p-4">
                    <button onClick={() => setOpenId(f.id)} className="w-full text-left">
                      <div className="flex items-start gap-3">
                        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", kindTone[f.kind])}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate pr-16 text-sm font-semibold">{f.name}</p>
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
                    <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon-xs" title="Download" onClick={() => download(f)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" title="Rename / move" onClick={() => setEditing(f)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Delete"
                        onClick={() =>
                          confirm({
                            title: `Delete ${f.name}?`,
                            description: "This permanently removes the file from the vault.",
                            onConfirm: () => {
                              remove(f.id);
                              toast.success("File deleted");
                            },
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="surface-card p-10 text-center text-sm text-muted-foreground">No files match your search.</p>
        )}
      </div>

      {open && (
        <FilePreview
          file={open}
          onClose={() => setOpenId(null)}
          onDownload={() => download(open)}
          onEdit={() => {
            setEditing(open);
            setOpenId(null);
          }}
        />
      )}

      {editing && (
        <FileEditor
          file={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            update(editing.id, patch);
            setEditing(null);
            toast.success("File updated");
          }}
        />
      )}

      {confirmEl}
    </div>
  );
}

function useLookups() {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { milestones } = useWorkspace();
  return { projects, clients, milestones };
}

function FilePreview({
  file,
  onClose,
  onDownload,
  onEdit,
}: {
  file: VaultFile;
  onClose: () => void;
  onDownload: () => void;
  onEdit: () => void;
}) {
  const Icon = kindIcon[file.kind];
  const { projects, clients, milestones } = useLookups();
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
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" title="Download" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" title="Rename / move" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface-2">
          {file.dataUrl && file.kind === "Image" ? (
            <img src={file.dataUrl} alt={file.name} className="max-h-72 w-full object-contain" />
          ) : file.dataUrl && file.kind === "Video" ? (
            <video src={file.dataUrl} controls className="max-h-72 w-full" />
          ) : file.dataUrl && file.kind === "Audio" ? (
            <audio src={file.dataUrl} controls className="w-full p-4" />
          ) : file.dataUrl && file.kind === "PDF" ? (
            <iframe src={file.dataUrl} title={file.name} className="h-72 w-full" />
          ) : file.preview === "image" ? (
            <div className="grid h-56 place-items-center brand-gradient text-primary-foreground">
              <ImageIcon className="h-10 w-10 opacity-80" />
            </div>
          ) : file.preview === "video" ? (
            <div className="grid h-56 place-items-center bg-foreground/90 text-background">
              <Film className="h-10 w-10 opacity-80" />
            </div>
          ) : file.preview === "audio" ? (
            <div className="grid h-40 place-items-center text-muted-foreground">
              <FileAudio className="h-10 w-10" />
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

function FileEditor({
  file,
  onClose,
  onSave,
}: {
  file: VaultFile;
  onClose: () => void;
  onSave: (patch: Partial<VaultFile>) => void;
}) {
  const { projects, clients, milestones } = useLookups();
  const [name, setName] = useState(file.name);
  const [description, setDescription] = useState(file.description);
  const [projectId, setProjectId] = useState(file.projectId);
  const [clientId, setClientId] = useState(file.clientId);
  const [milestoneId, setMilestoneId] = useState(file.milestoneId ?? "");
  const projectMilestones = milestones.filter((m) => m.projectId === projectId);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) {
            toast.error("File name is required");
            return;
          }
          onSave({ name: name.trim(), description, projectId, clientId, milestoneId: milestoneId || null });
        }}
        className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-background p-6"
      >
        <h2 className="text-base font-bold">Rename & move file</h2>

        <label className="block text-xs font-medium text-muted-foreground">
          File name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          />
        </label>

        <label className="block text-xs font-medium text-muted-foreground">
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-xs font-medium text-muted-foreground">
            Client
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Project
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setMilestoneId("");
              }}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Milestone
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              <option value="">Unlinked</option>
              {projectMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
