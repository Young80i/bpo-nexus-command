import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive, Code2, Database, Download, FileAudio, File as FileIcon,
  FileSpreadsheet, FileText, Film, Gamepad2, Image as ImageIcon,
  Pencil, Presentation, Search, Trash2, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { fileKinds, type FileKind, type VaultFile } from "@/data/files";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

// --- NEW SUPABASE HOOKS ---
import { useSupabaseProjects } from "@/lib/supabase/hooks/useSupabaseProjects";
import { useSupabaseClients } from "@/lib/supabase/hooks/useSupabaseClients";
import { useSupabaseFiles } from "@/lib/supabase/hooks/useSupabaseFiles";
import { useWorkspace } from "@/lib/workspace-store"; // Keeping milestones local for now

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "File Vault — Client & Project Documents | BPO Nexus" },
      { name: "description", content: "Central vault for project deliverables." }
    ],
  }),
  component: FilesPage,
});

const kindIcon: Record<FileKind, typeof FileText> = {
  Image: ImageIcon, Video: Film, Audio: FileAudio, Document: FileText,
  PDF: FileText, Spreadsheet: FileSpreadsheet, Presentation: Presentation,
  ZIP: Archive, "Source Code": Code2, "Game Asset": Gamepad2, Data: Database, Other: FileIcon,
};

const kindTone: Record<FileKind, string> = {
  Image: "bg-info/12 text-info", Video: "bg-primary/12 text-primary", Audio: "bg-info/12 text-info",
  Document: "bg-surface-2 text-muted-foreground", PDF: "bg-destructive/12 text-destructive",
  Spreadsheet: "bg-success/12 text-success", Presentation: "bg-warning/15 text-warning",
  ZIP: "bg-warning/15 text-warning", "Source Code": "bg-success/12 text-success",
  "Game Asset": "bg-primary/12 text-primary", Data: "bg-info/12 text-info", Other: "bg-surface-2 text-muted-foreground",
};

type GroupBy = "client" | "project" | "milestone";

function getKindFromType(type: string): FileKind {
  const t = String(type).toLowerCase();
  if (/(jpg|jpeg|png|gif|webp|svg)/.test(t)) return "Image";
  if (/(mp4|webm|mov)/.test(t)) return "Video";
  if (/(mp3|wav|ogg)/.test(t)) return "Audio";
  if (/(pdf)/.test(t)) return "PDF";
  if (/(zip|rar|tar|gz)/.test(t)) return "ZIP";
  if (/(xls|csv)/.test(t)) return "Spreadsheet";
  if (/(doc|txt)/.test(t)) return "Document";
  return "Other";
}

function FilesPage() {
  const { projects } = useSupabaseProjects();
  const { clients } = useSupabaseClients();
  const { milestones } = useWorkspace();
  const { files: dbFiles, uploadFile, deleteFile, refresh } = useSupabaseFiles();
  const { confirm, element: confirmEl } = useConfirm();

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | FileKind>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("project");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<VaultFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Map database rows to the UI formatting
  const files = useMemo(() => {
    return dbFiles.map((f: any) => {
      const mappedKind = getKindFromType(f.type);
      return {
        id: f.id,
        name: f.name,
        description: f.category || "",
        kind: mappedKind,
        size: `${Math.round(f.size / 1024)} KB`,
        dataUrl: f.url,
        projectId: f.project_id || "",
        clientId: projects.find(p => p.id === f.project_id)?.client_id || "",
        milestoneId: null,
        uploaded: new Date(f.created_at).toLocaleDateString(),
        uploadedBy: "Me",
        preview: mappedKind === "Image" ? "image" : mappedKind === "Video" ? "video" : undefined,
        storagePath: f.storage_path
      } as any;
    });
  }, [dbFiles, projects]);

  const filtered = useMemo(() => files.filter((f: any) => {
    const q = query.trim().toLowerCase();
    const matches = !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    return matches && (kind === "all" || f.kind === kind);
  }), [files, query, kind]);

  const groups = useMemo(() => {
    const map = new Map<string, VaultFile[]>();
    for (const f of filtered) {
      const key = groupBy === "client" ? (clients.find((c: any) => c.id === f.clientId)?.company ?? "Unassigned client")
        : groupBy === "project" ? (projects.find((p: any) => p.id === f.projectId)?.name ?? "Unassigned project")
        : (milestones.find((m) => m.id === f.milestoneId)?.title ?? "No milestone");
      map.set(key, [...(map.get(key) ?? []), f]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, groupBy, clients, projects, milestones]);

  const open = files.find((f: any) => f.id === openId) ?? null;

  const handleUpload = async (list: FileList | null) => {
    if (!list?.length) return;
    setUploading(true);
    const fallback = projects[0];
    try {
      for (const file of Array.from(list)) {
        await uploadFile(file, { projectId: fallback?.id });
      }
      toast.success(`${list.length} file${list.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const download = (f: VaultFile) => {
    if (f.dataUrl) {
      window.open(f.dataUrl, '_blank');
      toast.success(`Opening ${f.name}`);
      return;
    }
    toast.info("This file has no readable URL.");
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="File Vault"
        description={`${filtered.length} files across projects and clients`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files…" className="h-9 w-52 rounded-lg border border-input bg-background pl-8 pr-3 text-sm" />
            </div>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="client">Group by client</option>
              <option value="project">Group by project</option>
              <option value="milestone">Group by milestone</option>
            </select>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => void handleUpload(e.target.files)} />
            <Button size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Add file"}
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {(["all", ...fileKinds] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors", kind === k ? "border-primary/40 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:bg-accent")}>
            {k === "all" ? "All types" : k}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {groups.map(([label, items]) => (
          <section key={label}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-semibold">{label}</h2>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground">{items.length}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((f: any) => {
                const Icon = kindIcon[f.kind as FileKind] || FileIcon;
                return (
                  <div key={f.id} className="surface-card lift group relative p-4">
                    <button onClick={() => setOpenId(f.id)} className="w-full text-left">
                      <div className="flex items-start gap-3">
                        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", kindTone[f.kind as FileKind])}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate pr-16 text-sm font-semibold">{f.name}</p>
                          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{f.kind} · {f.size}</p>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{f.description}</p>
                      <p className="mt-3 text-[0.68rem] text-muted-foreground">{f.uploadedBy} · {f.uploaded}</p>
                    </button>
                    <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon-xs" title="Download" onClick={() => download(f)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" title="Edit" onClick={() => setEditing(f)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" title="Delete" onClick={() => confirm({ title: `Delete ${f.name}?`, description: "This removes the file permanently.", onConfirm: async () => { await deleteFile(f.id, f.storagePath); toast.success("File deleted"); } })}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && <p className="surface-card p-10 text-center text-sm text-muted-foreground">No files match your search.</p>}
      </div>

      {open && <FilePreview file={open as any} onClose={() => setOpenId(null)} onDownload={() => download(open as any)} onEdit={() => { setEditing(open as any); setOpenId(null); }} />}

      {editing && (
        <FileEditor file={editing} onClose={() => setEditing(null)} onSave={async (patch) => {
          await supabase.from('repositories').update({ name: patch.name, category: patch.description, project_id: patch.projectId }).eq('id', editing.id);
          refresh();
          setEditing(null);
          toast.success("File updated");
        }} />
      )}
      {confirmEl}
    </div>
  );
}

function useLookups() {
  const { projects } = useSupabaseProjects();
  const { clients } = useSupabaseClients();
  const { milestones } = useWorkspace();
  return { projects, clients, milestones };
}

function FilePreview({ file, onClose, onDownload, onEdit }: { file: VaultFile; onClose: () => void; onDownload: () => void; onEdit: () => void; }) {
  const Icon = kindIcon[file.kind] || FileIcon;
  const { projects, clients, milestones } = useLookups();
  const client = clients.find((c: any) => c.id === file.clientId);
  const project = projects.find((p: any) => p.id === file.projectId);
  const milestone = milestones.find((m: any) => m.id === file.milestoneId);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", kindTone[file.kind])}><Icon className="h-5 w-5" /></span>
            <div className="min-w-0"><h2 className="truncate text-base font-bold">{file.name}</h2><p className="text-xs text-muted-foreground">{file.kind} · {file.size} · uploaded {file.uploaded}</p></div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={onDownload}><Download className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon-sm" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface-2">
          {file.dataUrl && file.kind === "Image" ? <img src={file.dataUrl} alt={file.name} className="max-h-72 w-full object-contain" /> : <div className="grid h-40 place-items-center text-xs">Preview unavailable</div>}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{file.description}</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          {[{ label: "Client", value: client?.company ?? "—" }, { label: "Project", value: project?.name ?? "—" }, { label: "Milestone", value: milestone?.title ?? "Unlinked" }].map((row) => (
            <div key={row.label} className="rounded-lg border border-border bg-surface-2 p-3"><dt className="text-[0.7rem] text-muted-foreground">{row.label}</dt><dd className="mt-0.5 text-sm font-medium">{row.value}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function FileEditor({ file, onClose, onSave }: { file: VaultFile; onClose: () => void; onSave: (patch: Partial<VaultFile>) => void; }) {
  const { projects, clients, milestones } = useLookups();
  const [name, setName] = useState(file.name);
  const [description, setDescription] = useState(file.description);
  const [projectId, setProjectId] = useState(file.projectId);
  const [clientId, setClientId] = useState(file.clientId);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave({ name, description, projectId, clientId }); }} className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-background p-6">
        <h2 className="text-base font-bold">Rename & Move File</h2>
        <label className="block text-xs text-muted-foreground">File name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-9 w-full rounded-lg border px-3 text-sm text-foreground" /></label>
        <label className="block text-xs text-muted-foreground">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-foreground" /></label>
        <div className="flex justify-end gap-2 pt-1"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></div>
      </form>
    </div>
  );
}