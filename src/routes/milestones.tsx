import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, FileText, Plus, Trash2, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { ProgressBar } from "@/components/badges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// SUPABASE HOOKS
import { useSupabaseProjects } from "@/lib/supabase/hooks/useSupabaseProjects";
import { useSupabaseMilestones } from "@/lib/supabase/hooks/useSupabaseMilestones";
import { formatMoney } from "@/data/demo";
import {
  milestoneStages,
  projectCompletion,
  type ApprovalStatus,
  type MilestoneStage,
} from "@/data/workspace";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/milestones")({
  head: () => ({
    meta: [
      { title: "Milestones — Drag & Drop Delivery Board | BPO Nexus" },
    ],
  }),
  component: MilestonesPage,
});

const stageTone: Record<MilestoneStage, string> = {
  Planning: "text-muted-foreground",
  "In Progress": "text-primary",
  Testing: "text-info",
  "Waiting Approval": "text-warning",
  Completed: "text-success",
  Cancelled: "text-destructive",
};

const approvalTone: Record<ApprovalStatus, string> = {
  "Not Submitted": "bg-muted text-muted-foreground border-border",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Approved: "bg-success/12 text-success border-success/25",
  "Changes Requested": "bg-info/12 text-info border-info/25",
  Rejected: "bg-destructive/12 text-destructive border-destructive/25",
};

function MilestonesPage() {
  const { projects } = useSupabaseProjects();
  const { milestones: dbMilestones, addMilestone, updateMilestone, deleteMilestone } = useSupabaseMilestones();
  
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<MilestoneStage | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const project = projects.find((p) => p.id === projectId) ?? projects[0];

  // Map Supabase rows to match UI expectations
  const list = useMemo(() => dbMilestones
    .filter((m: any) => m.project_id === project?.id)
    .map((m: any) => ({
      id: m.id,
      projectId: m.project_id,
      title: m.title || "Untitled",
      description: m.description || "",
      stage: (m.status as MilestoneStage) || "Planning",
      budget: Number(m.budget) || 0,
      deadline: m.due_date ? new Date(m.due_date).toISOString().slice(0, 10) : "No date",
      progress: m.progress || 0,
      approval: (m.approval as ApprovalStatus) || "Not Submitted",
      completionDate: m.completion_date || null,
      deliverables: m.deliverables || [],
      files: m.files || []
    })), [dbMilestones, project?.id]);

  const completion = projectCompletion(list as any);
  const budget = list.reduce((s: number, m: any) => s + m.budget, 0);
  const released = list.filter((m: any) => m.stage === "Completed").reduce((s: number, m: any) => s + m.budget, 0);

  const moveMilestone = async (id: string, stage: MilestoneStage) => {
    try {
      const updates = { 
        status: stage,
        progress: stage === "Completed" ? 100 : stage === "Cancelled" ? 0 : undefined,
        completion_date: stage === "Completed" ? new Date().toISOString().slice(0, 10) : null,
        approval: stage === "Completed" ? "Approved" : stage === "Waiting Approval" ? "Pending" : stage === "Cancelled" ? "Rejected" : undefined
      };
      Object.keys(updates).forEach(key => updates[key as keyof typeof updates] === undefined && delete updates[key as keyof typeof updates]);
      await updateMilestone(id, updates);
      toast.success("Milestone moved");
    } catch (err) {
      toast.error("Failed to move milestone");
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (typeof deleteMilestone === "function") {
        await deleteMilestone(id);
      }
      if (detail?.id === id) setDetail(null);
      toast.success("Milestone deleted");
    } catch (err) {
      toast.error("Failed to delete milestone");
    }
  };

  if (!project) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Milestones"
        description="Unlimited milestones per project — drag between stages to update delivery status"
        actions={
          <>
            <select value={project.id} onChange={(e) => setProjectId(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New milestone</Button>
          </>
        }
      />

      <section className="surface-card mb-6 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Auto project completion</p>
            <p className="mt-1 truncate font-display text-xl font-bold">{project.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div><p className="text-xs text-muted-foreground">Milestones</p><p className="font-semibold">{list.length}</p></div>
            <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-semibold">{formatMoney(budget, project.currency || 'USD')}</p></div>
            <div><p className="text-xs text-muted-foreground">Released</p><p className="font-semibold text-success">{formatMoney(released, project.currency || 'USD')}</p></div>
            <div className="text-right"><p className="text-xs text-muted-foreground">Completion</p><p className="font-display text-2xl font-bold">{completion}%</p></div>
          </div>
        </div>
        <ProgressBar value={completion} className="mt-4 h-2" />
      </section>

      <div className="scrollbar-thin -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-4">
        {milestoneStages.map((stage) => {
          const items = list.filter((m: any) => m.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
              onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
              onDrop={() => {
                if (dragId) moveMilestone(dragId, stage);
                setDragId(null);
                setOverStage(null);
              }}
              className={cn("w-[300px] shrink-0 snap-start rounded-xl border border-border/70 bg-surface-1 p-3 transition-colors", overStage === stage && "border-primary/60 bg-primary/5")}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className={cn("text-sm font-semibold", stageTone[stage])}>{stage}</p>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((m: any) => (
                  <article
                    key={m.id}
                    draggable
                    onDragStart={() => setDragId(m.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => setDetail(m)}
                    className={cn("surface-card group relative cursor-grab p-3.5 transition-all duration-200 lift active:cursor-grabbing", dragId === m.id && "opacity-50")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug">{m.title}</p>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(m.id, e)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        title="Delete milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{m.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> {formatMoney(m.budget, project.currency || 'USD')}</span>
                      <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" /> {m.deadline}</span>
                    </div>
                    <ProgressBar value={m.progress} className="mt-3" />
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.68rem]">
                      <span className={cn("rounded-full border px-2 py-0.5 font-semibold", approvalTone[m.approval as ApprovalStatus])}>{m.approval}</span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground"><CheckCircle2 className="h-3 w-3" />{m.deliverables?.filter((d:any) => d.done).length}/{m.deliverables?.length || 0}</span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground"><FileText className="h-3 w-3" /> {m.files?.length || 0}</span>
                    </div>
                  </article>
                ))}
                {!items.length && <p className="rounded-lg border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground">Drop milestones here</p>}
              </div>
            </div>
          );
        })}
      </div>

      <MilestoneDetail
        milestone={detail}
        currency={project.currency || 'USD'}
        onClose={() => setDetail(null)}
        onDelete={() => handleDelete(detail.id)}
        onChange={async (patch) => {
          if (!detail) return;
          try {
            const updates: any = {};
            if (patch.progress !== undefined) updates.progress = patch.progress;
            if (patch.approval !== undefined) updates.approval = patch.approval;
            if (patch.deliverables !== undefined) updates.deliverables = patch.deliverables;
            await updateMilestone(detail.id, updates);
            setDetail({ ...detail, ...patch });
            toast.success("Milestone updated");
          } catch(err) {
            toast.error("Failed to update milestone");
          }
        }}
      />

      <NewMilestoneDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={async (data) => {
          try {
            await addMilestone({
              project_id: project.id,
              title: data.title,
              description: data.description,
              budget: data.budget,
              due_date: new Date(data.deadline).toISOString(),
              status: "Planning",
              progress: 0,
              approval: "Not Submitted",
              deliverables: data.deliverables.split(",").map((d) => d.trim()).filter(Boolean).map((label) => ({ label, done: false }))
            } as any);
            setCreating(false);
            toast.success("Milestone created!");
          } catch(err) {
            toast.error("Failed to create milestone");
          }
        }}
      />
    </div>
  );
}

function MilestoneDetail({ milestone, currency, onClose, onDelete, onChange }: { milestone: any; currency: string; onClose: () => void; onDelete: () => void; onChange: (patch: any) => void; }) {
  if (!milestone) return null;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pr-6">
          <DialogTitle>{milestone.title}</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onDelete} className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">{milestone.description}</p>
        <div className="grid gap-4 sm:grid-cols-4">
          {[["Budget", formatMoney(milestone.budget, currency)], ["Deadline", milestone.deadline], ["Status", milestone.stage], ["Completed", milestone.completionDate ?? "—"]].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border/70 bg-surface-1 p-3"><p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>
          ))}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold">Progress</span><span className="text-muted-foreground">{milestone.progress}%</span></div>
          <input type="range" min={0} max={100} step={5} value={milestone.progress} onChange={(e) => onChange({ progress: Number(e.target.value) })} className="w-full accent-primary" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold">Deliverables</p>
            <ul className="space-y-2">
              {milestone.deliverables.map((d:any, i:number) => (
                <li key={d.label} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={d.done} onChange={() => onChange({ deliverables: milestone.deliverables.map((x:any, xi:number) => xi === i ? { ...x, done: !x.done } : x) })} className="h-4 w-4 accent-primary" />
                  <span className={cn(d.done && "text-muted-foreground line-through")}>{d.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Files</p>
            <ul className="space-y-2">
              {milestone.files.map((f:any) => (
                <li key={f.name} className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-1 px-3 py-2 text-sm"><FileText className="h-4 w-4 text-muted-foreground" /><span className="truncate">{f.name}</span><span className="ml-auto text-xs text-muted-foreground">{f.size}</span></li>
              ))}
              {!milestone.files.length && <li className="text-sm text-muted-foreground">No files attached</li>}
            </ul>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Approval status</p>
          <div className="flex flex-wrap gap-2">
            {(["Not Submitted", "Pending", "Approved", "Changes Requested", "Rejected"] as ApprovalStatus[]).map((a) => (
              <button key={a} onClick={() => onChange({ approval: a })} className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors", milestone.approval === a ? approvalTone[a] : "border-border text-muted-foreground hover:bg-accent")}>{a}</button>
            ))}
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewMilestoneDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (data: any) => void; }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(5000);
  const [deadline, setDeadline] = useState("2026-09-30");
  const [deliverables, setDeliverables] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>New milestone</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground resize-none" placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground" type="number" placeholder="Budget" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground" placeholder="Deliverables (comma separated)" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!title.trim()} onClick={() => onCreate({ title, description, budget, deadline, deliverables })}>Create milestone</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}