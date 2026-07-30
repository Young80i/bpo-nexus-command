import { projects, type Priority } from "./demo";

export const taskStatuses = ["Backlog", "In Progress", "In Review", "Blocked", "Done"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export type TaskAttachment = { name: string; size: string; type: string };

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  assignee: string;
  notes: string;
  attachments: TaskAttachment[];
  progress: number;
  startDate: string;
};

export const assignees = ["You", "Priya N.", "Andrés L.", "Rafael M.", "Mei T.", "Jonas K."];

const templates: { title: string; description: string; notes: string; att: TaskAttachment[] }[] = [
  {
    title: "Wire telemetry ingestion queue",
    description: "Stream events into the queue with retry, dead-letter handling and back-pressure metrics.",
    notes: "Client wants throughput reported in the Friday demo.",
    att: [{ name: "queue-design.pdf", size: "820 KB", type: "PDF" }],
  },
  {
    title: "Design dashboard shell in Figma",
    description: "Navigation, KPI cards and responsive breakpoints for the executive dashboard.",
    notes: "Follow the approved brand kit; dark mode is mandatory.",
    att: [{ name: "dashboard-v4.fig", size: "12.4 MB", type: "FIG" }],
  },
  {
    title: "Implement role-based access control",
    description: "Roles table, security-definer checks and route guards for admin and viewer roles.",
    notes: "No roles on the profile table — separate table only.",
    att: [{ name: "rls-policies.sql", size: "34 KB", type: "SQL" }],
  },
  {
    title: "Build reporting export pipeline",
    description: "Scheduled CSV and PDF exports with per-client branding and email delivery.",
    notes: "Exports must respect the client timezone.",
    att: [{ name: "export-spec.docx", size: "210 KB", type: "DOCX" }],
  },
  {
    title: "Performance profiling pass",
    description: "Profile hot paths, add indexes and reduce first contentful paint below 1.4s.",
    notes: "Baseline captured on 2026-07-12.",
    att: [{ name: "profile-trace.zip", size: "44 MB", type: "ZIP" }],
  },
  {
    title: "Client revision round 2",
    description: "Apply the feedback from the review call: copy changes, spacing and empty states.",
    notes: "14 comments in the shared doc.",
    att: [],
  },
  {
    title: "Set up CI/CD and preview deploys",
    description: "Pipeline with typecheck, tests, preview environments and production promotion.",
    notes: "Use the shared runner pool.",
    att: [{ name: "pipeline.yml", size: "6 KB", type: "YAML" }],
  },
  {
    title: "Write API integration tests",
    description: "Contract tests for every public endpoint plus fixtures and seeded test data.",
    notes: "Target 85% coverage on the service layer.",
    att: [],
  },
];

const statusCycle: TaskStatus[] = ["In Progress", "Backlog", "In Review", "Done", "Blocked", "In Progress", "Backlog", "Done"];
const priorityCycle: Priority[] = ["Critical", "High", "Medium", "Low", "High", "Medium", "Critical", "Low"];

function dayOffset(days: number) {
  const d = new Date("2026-07-30T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const tasks: Task[] = projects.slice(0, 7).flatMap((project, pi) =>
  templates.slice(0, 5 + (pi % 4)).map((t, i) => {
    const status = statusCycle[(pi + i) % statusCycle.length];
    return {
      id: `t${pi + 1}-${i + 1}`,
      projectId: project.id,
      title: t.title,
      description: t.description,
      priority: priorityCycle[(pi * 2 + i) % priorityCycle.length],
      status,
      dueDate: dayOffset(((pi * 5 + i * 3) % 26) - 4),
      startDate: dayOffset(((pi * 5 + i * 3) % 26) - 14),
      assignee: assignees[(pi + i) % assignees.length],
      notes: t.notes,
      attachments: t.att,
      progress: status === "Done" ? 100 : status === "Backlog" ? 0 : 20 + ((pi * 13 + i * 17) % 65),
    };
  }),
);
