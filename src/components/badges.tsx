import { cn } from "@/lib/utils";
import type { Priority, ProjectStatus } from "@/data/demo";

const statusStyles: Record<ProjectStatus, string> = {
  Discovery: "bg-info/12 text-info border-info/25",
  "In Progress": "bg-primary/12 text-primary border-primary/25",
  Review: "bg-warning/15 text-warning border-warning/30",
  "Waiting for Client": "bg-destructive/12 text-destructive border-destructive/25",
  Completed: "bg-success/12 text-success border-success/25",
  Archived: "bg-muted text-muted-foreground border-border",
};

const priorityStyles: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-info/12 text-info border-info/25",
  High: "bg-warning/15 text-warning border-warning/30",
  Critical: "bg-destructive/12 text-destructive border-destructive/25",
};

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap";

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn(base, statusStyles[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return <span className={cn(base, priorityStyles[priority], className)}>{priority}</span>;
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div
        className="h-full rounded-full brand-gradient transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
