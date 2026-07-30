import { useMemo, useState, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  Columns3,
  GanttChartSquare,
  List,
  Paperclip,
  Table as TableIcon,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { PriorityBadge, ProgressBar } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/demo";
import { tasks as seedTasks, taskStatuses, type Task, type TaskStatus } from "@/data/tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Manager — Kanban, Calendar & Timeline | BPO Nexus" },
      {
        name: "description",
        content:
          "Assign, prioritise and track delivery tasks across kanban, calendar, list, table and timeline views with drag and drop.",
      },
      { property: "og:title", content: "Task Manager — BPO Nexus" },
      { property: "og:description", content: "Five views, drag and drop, attachments and progress for every task." },
    ],
  }),
  component: TasksPage,
});

const views = [
  { key: "kanban", label: "Kanban", icon: Columns3 },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "list", label: "List", icon: List },
  { key: "table", label: "Table", icon: TableIcon },
  { key: "timeline", label: "Timeline", icon: GanttChartSquare },
] as const;
type ViewKey = (typeof views)[number]["key"];

const statusTone: Record<TaskStatus, string> = {
  Backlog: "bg-muted text-muted-foreground border-border",
  "In Progress": "bg-primary/12 text-primary border-primary/25",
  "In Review": "bg-warning/15 text-warning border-warning/30",
  Blocked: "bg-destructive/12 text-destructive border-destructive/25",
  Done: "bg-success/12 text-success border-success/25",
};

const TODAY = new Date("2026-07-30T00:00:00Z");

function projectName(id: string) {
  return projects.find((p) => p.id === id)?.name ?? "—";
}

function StatusPill({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap",
        statusTone[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [view, setView] = useState<ViewKey>("kanban");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        const q = query.trim().toLowerCase();
        const matches =
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q);
        return matches && (projectFilter === "all" || t.projectId === projectFilter);
      }),
    [tasks, query, projectFilter],
  );

  const move = (id: string, status: TaskStatus) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status, progress: status === "Done" ? 100 : status === "Backlog" ? 0 : Math.max(t.progress, 10) }
          : t,
      ),
    );

  const reschedule = (id: string, dueDate: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate } : t)));

  const onDragStart = (id: string) => (e: DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const open = tasks.find((t) => t.id === openId) ?? null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Task Manager"
        description={`${filtered.length} tasks · drag cards between columns or calendar days`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="h-9 w-44 rounded-lg border border-input bg-background px-3 text-sm"
            />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="all">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="mb-5 inline-flex flex-wrap gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              view === v.key ? "bg-background text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <v.icon className="h-4 w-4" /> {v.label}
          </button>
        ))}
      </div>

      {view === "kanban" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {taskStatuses.map((status) => {
            const col = filtered.filter((t) => t.status === status);
            return (
              <div
                key={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(status);
                }}
                onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
                onDrop={() => {
                  if (dragId) move(dragId, status);
                  setDragId(null);
                  setOverCol(null);
                }}
                className={cn(
                  "rounded-xl border border-border bg-surface-2/60 p-3 transition-colors",
                  overCol === status && "border-primary/50 bg-accent",
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{status}</p>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[0.68rem] font-semibold">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((t) => (
                    <article
                      key={t.id}
                      draggable
                      onDragStart={onDragStart(t.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => setOpenId(t.id)}
                      className={cn(
                        "cursor-grab rounded-xl border border-border bg-background p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 active:cursor-grabbing",
                        dragId === t.id && "opacity-50",
                      )}
                    >
                      <p className="text-sm font-semibold leading-snug">{t.title}</p>
                      <p className="mt-1 truncate text-[0.7rem] text-muted-foreground">{projectName(t.projectId)}</p>
                      <div className="mt-2">
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <ProgressBar value={t.progress} className="mt-3" />
                      <div className="mt-2.5 flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-[0.6rem] font-bold text-foreground">
                          {t.assignee.slice(0, 2).toUpperCase()}
                        </span>
                        <span>{t.dueDate.slice(5)}</span>
                        {t.attachments.length > 0 && (
                          <span className="ml-auto inline-flex items-center gap-1">
                            <Paperclip className="h-3 w-3" /> {t.attachments.length}
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                  {col.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                      Drop tasks here
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "calendar" && <CalendarView tasks={filtered} onDrop={reschedule} onOpen={setOpenId} dragId={dragId} setDragId={setDragId} />}

      {view === "list" && (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setOpenId(t.id)}
              className="surface-card lift flex cursor-pointer flex-wrap items-center gap-3 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{t.title}</p>
                  <PriorityBadge priority={t.priority} />
                  <StatusPill status={t.status} />
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{t.description}</p>
              </div>
              <div className="w-40 shrink-0">
                <ProgressBar value={t.progress} />
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{t.assignee}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{t.dueDate}</span>
            </div>
          ))}
        </div>
      )}

      {view === "table" && (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {["Task", "Project", "Assignee", "Priority", "Status", "Due", "Progress"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setOpenId(t.id)}
                  className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/60"
                >
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{projectName(t.projectId)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.assignee}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.dueDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={t.progress} className="w-24" />
                      <span className="text-xs text-muted-foreground">{t.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "timeline" && <TimelineView tasks={filtered} onOpen={setOpenId} />}

      {open && (
        <TaskDrawer
          task={open}
          onClose={() => setOpenId(null)}
          onChange={(patch) => setTasks((prev) => prev.map((t) => (t.id === open.id ? { ...t, ...patch } : t)))}
        />
      )}
    </div>
  );
}

function CalendarView({
  tasks,
  onDrop,
  onOpen,
  dragId,
  setDragId,
}: {
  tasks: Task[];
  onDrop: (id: string, date: string) => void;
  onOpen: (id: string) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
}) {
  const year = TODAY.getUTCFullYear();
  const month = TODAY.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, i) =>
    i < startOffset ? null : new Date(Date.UTC(year, month, i - startOffset + 1)).toISOString().slice(0, 10),
  );

  return (
    <div className="surface-card p-4">
      <p className="mb-3 text-sm font-semibold">
        {first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}
      </p>
      <div className="grid grid-cols-7 gap-2 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-1 pb-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((date, i) => (
          <div
            key={date ?? `empty-${i}`}
            onDragOver={(e) => date && e.preventDefault()}
            onDrop={() => {
              if (date && dragId) onDrop(dragId, date);
              setDragId(null);
            }}
            className={cn(
              "min-h-[104px] rounded-lg border border-border p-1.5",
              date ? "bg-surface-2/50" : "border-transparent",
              date === TODAY.toISOString().slice(0, 10) && "border-primary/50 bg-accent",
            )}
          >
            {date && <p className="mb-1 px-0.5 text-[0.68rem] font-semibold text-muted-foreground">{Number(date.slice(8))}</p>}
            <div className="space-y-1">
              {tasks
                .filter((t) => t.dueDate === date)
                .map((t) => (
                  <button
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => onOpen(t.id)}
                    className="block w-full cursor-grab truncate rounded-md bg-primary/12 px-1.5 py-1 text-left text-[0.68rem] font-medium text-primary hover:bg-primary/20"
                  >
                    {t.title}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ tasks, onOpen }: { tasks: Task[]; onOpen: (id: string) => void }) {
  const dates = tasks.flatMap((t) => [t.startDate, t.dueDate]).sort();
  const min = dates[0] ? Date.parse(dates[0]) : Date.now();
  const max = dates[dates.length - 1] ? Date.parse(dates[dates.length - 1]) : Date.now() + 1;
  const span = Math.max(1, max - min);

  return (
    <div className="surface-card overflow-x-auto p-4">
      <div className="min-w-[720px] space-y-2">
        {tasks.map((t) => {
          const left = ((Date.parse(t.startDate) - min) / span) * 100;
          const width = Math.max(4, ((Date.parse(t.dueDate) - Date.parse(t.startDate)) / span) * 100);
          return (
            <button
              key={t.id}
              onClick={() => onOpen(t.id)}
              className="grid w-full grid-cols-[200px_1fr] items-center gap-3 rounded-lg px-1 py-1.5 text-left hover:bg-accent/60"
            >
              <span className="truncate text-xs font-medium">{t.title}</span>
              <span className="relative block h-6 rounded-full bg-surface-2">
                <span
                  className="absolute top-0 h-6 rounded-full brand-gradient opacity-90"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
                <span
                  className="absolute top-1.5 text-[0.62rem] font-semibold text-primary-foreground"
                  style={{ left: `calc(${left}% + 8px)` }}
                >
                  {t.progress}%
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskDrawer({
  task,
  onClose,
  onChange,
}: {
  task: Task;
  onClose: () => void;
  onChange: (patch: Partial<Task>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-background p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{task.title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{projectName(task.projectId)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusPill status={task.status} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{task.description}</p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <dt className="text-[0.7rem] text-muted-foreground">Assigned to</dt>
            <dd className="mt-0.5 font-medium">{task.assignee}</dd>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <dt className="text-[0.7rem] text-muted-foreground">Due date</dt>
            <dd className="mt-0.5 font-medium">{task.dueDate}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress</p>
          <ProgressBar value={task.progress} className="mt-2 h-2" />
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={task.progress}
            onChange={(e) => onChange({ progress: Number(e.target.value) })}
            className="mt-3 w-full accent-primary"
          />
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
          <select
            value={task.status}
            onChange={(e) => onChange({ status: e.target.value as TaskStatus })}
            className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {taskStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
          <textarea
            value={task.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            rows={4}
            className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm"
          />
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Attachments ({task.attachments.length})
          </p>
          <ul className="mt-2 space-y-2">
            {task.attachments.map((a) => (
              <li key={a.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 p-2.5 text-xs">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-medium">{a.name}</span>
                <span className="shrink-0 text-muted-foreground">{a.size}</span>
              </li>
            ))}
            {task.attachments.length === 0 && <li className="text-xs text-muted-foreground">No attachments yet.</li>}
          </ul>
        </div>
      </aside>
    </div>
  );
}
