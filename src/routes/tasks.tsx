import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Plus, Trash2, User } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { PriorityBadge, StatusBadge } from "@/components/badges";
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
import { useSupabaseTasks } from "@/lib/supabase/hooks/useSupabaseTasks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Dev Kanban & Sprint Board | BPO Nexus" },
    ],
  }),
  component: TasksPage,
});

const taskStatuses = ["Todo", "In Progress", "Review", "Done"] as const;
type TaskStatus = (typeof taskStatuses)[number];

function TasksPage() {
  const { projects } = useSupabaseProjects();
  const { tasks: dbTasks, addTask, updateTask, deleteTask } = useSupabaseTasks();

  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const project = projects.find((p) => p.id === projectId) ?? projects[0];

  // Map Supabase rows to match UI expectations
  const list = useMemo(() => {
    return (dbTasks || [])
      .filter((t: any) => !project?.id || t.project_id === project?.id)
      .map((t: any) => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title || "Untitled Task",
        description: t.description || "",
        status: (t.status as TaskStatus) || "Todo",
        priority: t.priority || "Medium",
        assignee: t.assignee || "Unassigned",
        dueDate: t.due_date ? new Date(t.due_date).toISOString().slice(0, 10) : "No date",
      }));
  }, [dbTasks, project?.id]);

  const moveTask = async (id: string, status: TaskStatus) => {
    try {
      if (typeof updateTask === "function") {
        await updateTask(id, { status });
      }
      toast.success("Task updated");
    } catch (err) {
      toast.error("Failed to move task");
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (typeof deleteTask === "function") {
        await deleteTask(id);
      }
      if (detail?.id === id) setDetail(null);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tasks"
        description="Sprint backlog and active development tickets"
        actions={
          <>
            {projects.length > 0 && (
              <select
                value={project?.id || ""}
                onChange={(e) => setProjectId(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          </>
        }
      />

      <div className="scrollbar-thin -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-4">
        {taskStatuses.map((status) => {
          const items = list.filter((t: any) => t.status === status);
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStatus(status);
              }}
              onDragLeave={() => setOverStatus((s) => (s === status ? null : s))}
              onDrop={() => {
                if (dragId) moveTask(dragId, status);
                setDragId(null);
                setOverStatus(null);
              }}
              className={cn(
                "w-[300px] shrink-0 snap-start rounded-xl border border-border/70 bg-surface-1 p-3 transition-colors",
                overStatus === status && "border-primary/60 bg-primary/5"
              )}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-semibold">{status}</p>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((t: any) => (
                  <article
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => setDetail(t)}
                    className={cn(
                      "surface-card group relative cursor-grab p-3.5 transition-all duration-200 lift active:cursor-grabbing",
                      dragId === t.id && "opacity-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug">{t.title}</p>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(t.id, e)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {t.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {t.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2 text-[0.7rem] text-muted-foreground">
                      <PriorityBadge priority={t.priority} />
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {t.dueDate}
                      </span>
                    </div>
                  </article>
                ))}
                {!items.length && (
                  <p className="rounded-lg border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground">
                    Drop tasks here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetail
        task={detail}
        onClose={() => setDetail(null)}
        onDelete={() => handleDelete(detail.id)}
        onChange={async (patch) => {
          if (!detail) return;
          try {
            if (typeof updateTask === "function") {
              await updateTask(detail.id, patch);
            }
            setDetail({ ...detail, ...patch });
            toast.success("Task updated");
          } catch (err) {
            toast.error("Failed to update task");
          }
        }}
      />

      <NewTaskDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={async (data) => {
          try {
            if (typeof addTask === "function") {
              await addTask({
                project_id: project?.id,
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: "Todo",
                due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
              });
            }
            setCreating(false);
            toast.success("Task created!");
          } catch (err) {
            toast.error("Failed to create task");
          }
        }}
      />
    </div>
  );
}

function TaskDetail({
  task,
  onClose,
  onDelete,
  onChange,
}: {
  task: any;
  onClose: () => void;
  onDelete: () => void;
  onChange: (patch: any) => void;
}) {
  if (!task) return null;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between pr-6">
          <DialogTitle>{task.title}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{task.description || "No description provided."}</p>
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <select
              value={task.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className="h-8 rounded border border-input bg-background px-2 text-xs"
            >
              {taskStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Priority</span>
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Due Date</span>
            <span className="font-medium">{task.dueDate}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewTaskDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (data: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground resize-none"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {["Low", "Medium", "High", "Critical"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!title.trim()}
            onClick={() => onCreate({ title, description, priority, dueDate })}
          >
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}