import type { Client, Project } from "@/data/demo";
import type { Milestone, MilestoneStage } from "@/data/workspace";
import type { Task } from "@/data/tasks";

/* ------------------------------ Automation registry ----------------------------- */

export const automationCatalog = [
  {
    key: "stages",
    title: "Auto-generate project stages",
    description: "Creates the delivery track (planning → deployment) the moment a project is added.",
    category: "Project setup",
  },
  {
    key: "milestones",
    title: "Auto-generate milestones",
    description: "Builds a website or game milestone plan based on the detected project type.",
    category: "Project setup",
  },
  {
    key: "tasks",
    title: "Auto-generate tasks per milestone",
    description: "Breaks every milestone into actionable tasks with owners and due dates.",
    category: "Project setup",
  },
  {
    key: "briefAnalysis",
    title: "Analyse Freelancer briefs",
    description: "Turns a pasted project description into scope, stack, difficulty and a plan.",
    category: "Intelligence",
  },
  {
    key: "conversationAnalysis",
    title: "Analyse client conversations",
    description: "Extracts summary, action items, open questions and a suggested reply.",
    category: "Intelligence",
  },
  {
    key: "completion",
    title: "Auto-calculate completion",
    description: "Keeps project completion in sync with milestone progress and weight.",
    category: "Monitoring",
  },
  {
    key: "riskDetection",
    title: "Detect overdue & inactive work",
    description: "Flags overdue milestones, stalled projects and deadlines inside 7 days.",
    category: "Monitoring",
  },
  {
    key: "notifications",
    title: "Smart notifications & reminders",
    description: "Surfaces the signals that need action, ranked by severity.",
    category: "Monitoring",
  },
  {
    key: "dailyPlanner",
    title: "Daily AI work planner",
    description: "Today's priorities, projects needing attention, tasks due and upcoming milestones.",
    category: "Monitoring",
  },
  {
    key: "healthScore",
    title: "Project health score",
    description: "Scores every project on deadlines, progress and client activity.",
    category: "Monitoring",
  },
  {
    key: "deliveryPack",
    title: "Pre-delivery pack",
    description: "Delivery summary, testing checklist and handover notes before completion.",
    category: "Delivery",
  },
  {
    key: "fileOrganiser",
    title: "Auto-organise files",
    description: "Files are filed by client → project → milestone as soon as they land.",
    category: "Delivery",
  },
  {
    key: "portfolio",
    title: "Freelancer portfolio drafts",
    description: "Generates portfolio copy, tags, skills and software after completion.",
    category: "Delivery",
  },
] as const;

export type AutomationKey = (typeof automationCatalog)[number]["key"];

export const defaultAutomations = Object.fromEntries(
  automationCatalog.map((a) => [a.key, true]),
) as Record<AutomationKey, boolean>;

/* --------------------------------- Utilities ---------------------------------- */

const DAY = 86400000;
export const today = () => new Date(new Date().toISOString().slice(0, 10));
export const toDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`);
export const daysBetween = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / DAY);
export const addDays = (iso: string, days: number) => {
  const d = toDate(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export type ProjectKind = "Website" | "Game" | "Web App";

export function detectProjectKind(project: Pick<Project, "name" | "description" | "stack">): ProjectKind {
  const haystack = `${project.name} ${project.description} ${project.stack.join(" ")}`.toLowerCase();
  if (/(game|unity|unreal|godot|gameplay|multiplayer|player)/.test(haystack)) return "Game";
  if (/(marketing site|landing|website|webflow|wordpress|brochure)/.test(haystack)) return "Website";
  return "Web App";
}

/* ------------------------------- Completion % --------------------------------- */

const stageWeight: Record<MilestoneStage, number> = {
  Planning: 0,
  "In Progress": 0.5,
  Testing: 0.8,
  "Waiting Approval": 0.95,
  Completed: 1,
  Cancelled: 0,
};

export function projectCompletion(projectId: string, milestones: Milestone[]) {
  const list = milestones.filter((m) => m.projectId === projectId && m.stage !== "Cancelled");
  if (!list.length) return 0;
  const total = list.reduce(
    (sum, m) => sum + Math.max(m.progress / 100, stageWeight[m.stage]) * 100,
    0,
  );
  return Math.round(total / list.length);
}

/* ------------------------------- Health score --------------------------------- */

export type HealthFactor = { label: string; impact: number; detail: string };
export type Health = {
  score: number;
  band: "Excellent" | "Healthy" | "At Risk" | "Critical";
  factors: HealthFactor[];
};

export function projectHealth(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  lastClientActivityDays = 3,
): Health {
  const now = today();
  const factors: HealthFactor[] = [];
  let score = 100;

  const mine = milestones.filter((m) => m.projectId === project.id);
  const overdue = mine.filter(
    (m) => m.stage !== "Completed" && m.stage !== "Cancelled" && toDate(m.deadline) < now,
  );
  if (overdue.length) {
    const impact = Math.min(35, overdue.length * 12);
    score -= impact;
    factors.push({
      label: "Overdue milestones",
      impact: -impact,
      detail: `${overdue.length} milestone${overdue.length > 1 ? "s" : ""} past deadline`,
    });
  }

  const daysToDue = daysBetween(toDate(project.dueDate), now);
  const completion = projectCompletion(project.id, milestones) || project.progress;
  const elapsedShare = (() => {
    const span = Math.max(1, daysBetween(toDate(project.dueDate), toDate(project.startDate)));
    return Math.min(100, Math.max(0, (daysBetween(now, toDate(project.startDate)) / span) * 100));
  })();
  const drift = Math.round(completion - elapsedShare);
  if (drift < -10) {
    const impact = Math.min(30, Math.abs(drift));
    score -= impact;
    factors.push({
      label: "Behind schedule",
      impact: -impact,
      detail: `${completion}% delivered against ${Math.round(elapsedShare)}% of the timeline`,
    });
  } else {
    factors.push({
      label: "Schedule adherence",
      impact: 0,
      detail: `${completion}% delivered against ${Math.round(elapsedShare)}% of the timeline`,
    });
  }

  if (daysToDue < 0 && project.status !== "Completed") {
    score -= 20;
    factors.push({ label: "Project overdue", impact: -20, detail: `${Math.abs(daysToDue)} days past due` });
  } else if (daysToDue <= 7 && completion < 85) {
    score -= 10;
    factors.push({ label: "Deadline pressure", impact: -10, detail: `${daysToDue} days left` });
  }

  const blocked = tasks.filter((t) => t.projectId === project.id && t.status === "Blocked");
  if (blocked.length) {
    const impact = Math.min(15, blocked.length * 6);
    score -= impact;
    factors.push({ label: "Blocked tasks", impact: -impact, detail: `${blocked.length} blocked` });
  }

  if (lastClientActivityDays > 7) {
    score -= 10;
    factors.push({
      label: "Client silence",
      impact: -10,
      detail: `No client message for ${lastClientActivityDays} days`,
    });
  } else {
    factors.push({
      label: "Client activity",
      impact: 0,
      detail: `Last client message ${lastClientActivityDays} day(s) ago`,
    });
  }

  score = Math.max(4, Math.min(100, Math.round(score)));
  const band: Health["band"] =
    score >= 85 ? "Excellent" : score >= 70 ? "Healthy" : score >= 50 ? "At Risk" : "Critical";
  return { score, band, factors };
}

/* ------------------------------- Signals -------------------------------------- */

export type Signal = {
  id: string;
  kind: "Overdue" | "Upcoming" | "Inactive" | "Blocked" | "Approval";
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  projectId: string;
  date?: string;
};

export function detectSignals(projects: Project[], milestones: Milestone[], tasks: Task[]): Signal[] {
  const now = today();
  const signals: Signal[] = [];
  const live = projects.filter((p) => !p.archived && p.status !== "Completed");

  for (const project of live) {
    for (const m of milestones.filter((m) => m.projectId === project.id)) {
      if (m.stage === "Completed" || m.stage === "Cancelled") continue;
      const diff = daysBetween(toDate(m.deadline), now);
      if (diff < 0) {
        signals.push({
          id: `ov-${m.id}`,
          kind: "Overdue",
          severity: "high",
          title: `${m.title} is ${Math.abs(diff)} day(s) overdue`,
          detail: `${project.name} · ${m.progress}% complete · ${m.stage}`,
          projectId: project.id,
          date: m.deadline,
        });
      } else if (diff <= 7) {
        signals.push({
          id: `up-${m.id}`,
          kind: "Upcoming",
          severity: diff <= 2 ? "high" : "medium",
          title: `${m.title} due in ${diff} day(s)`,
          detail: `${project.name} · ${m.progress}% complete`,
          projectId: project.id,
          date: m.deadline,
        });
      }
      if (m.stage === "Waiting Approval" && m.approval === "Pending") {
        signals.push({
          id: `ap-${m.id}`,
          kind: "Approval",
          severity: "medium",
          title: `${m.title} awaiting client approval`,
          detail: `${project.name} · submitted for sign-off`,
          projectId: project.id,
          date: m.deadline,
        });
      }
    }

    const blocked = tasks.filter((t) => t.projectId === project.id && t.status === "Blocked");
    if (blocked.length) {
      signals.push({
        id: `bl-${project.id}`,
        kind: "Blocked",
        severity: "high",
        title: `${blocked.length} blocked task(s) on ${project.name}`,
        detail: blocked.map((t) => t.title).slice(0, 2).join(" · "),
        projectId: project.id,
      });
    }

    const activity = tasks.filter((t) => t.projectId === project.id && t.status === "In Progress");
    if (!activity.length && project.status === "In Progress") {
      signals.push({
        id: `in-${project.id}`,
        kind: "Inactive",
        severity: "medium",
        title: `${project.name} looks inactive`,
        detail: "No task is currently in progress — pick the next milestone task.",
        projectId: project.id,
      });
    }
  }

  const order = { high: 0, medium: 1, low: 2 };
  return signals.sort((a, b) => order[a.severity] - order[b.severity]);
}

/* ------------------------------ Daily planner --------------------------------- */

export type DailyPlan = {
  priorities: { title: string; why: string; projectId: string }[];
  attention: { project: Project; health: Health }[];
  dueToday: Task[];
  upcomingMilestones: Milestone[];
};

export function dailyPlan(projects: Project[], milestones: Milestone[], tasks: Task[]): DailyPlan {
  const now = today();
  const iso = now.toISOString().slice(0, 10);
  const live = projects.filter((p) => !p.archived && p.status !== "Completed");

  const attention = live
    .map((project) => ({ project, health: projectHealth(project, milestones, tasks) }))
    .filter((x) => x.health.score < 75)
    .sort((a, b) => a.health.score - b.health.score)
    .slice(0, 4);

  const dueToday = tasks
    .filter((t) => t.dueDate.slice(0, 10) === iso && t.status !== "Done")
    .slice(0, 8);

  const upcomingMilestones = milestones
    .filter((m) => {
      const d = daysBetween(toDate(m.deadline), now);
      return d >= 0 && d <= 14 && m.stage !== "Completed" && m.stage !== "Cancelled";
    })
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  const priorities: DailyPlan["priorities"] = [];
  const signals = detectSignals(projects, milestones, tasks);
  for (const s of signals.slice(0, 3)) {
    priorities.push({ title: s.title, why: s.detail, projectId: s.projectId });
  }
  for (const t of dueToday.slice(0, 3 - priorities.length > 0 ? 3 - priorities.length : 0)) {
    priorities.push({ title: t.title, why: `Due today · ${t.priority} priority`, projectId: t.projectId });
  }

  return { priorities, attention, dueToday, upcomingMilestones };
}

/* ------------------------- Generators (rule-based AI) -------------------------- */

export const websiteStagePlan = [
  "Planning",
  "UI Design",
  "Frontend",
  "Backend",
  "Authentication",
  "Database",
  "API",
  "Testing",
  "Deployment",
  "Client Revision",
];

export const gameStagePlan = [
  "Story",
  "Characters",
  "UI",
  "Gameplay",
  "Physics",
  "Audio",
  "Assets",
  "Levels",
  "Testing",
  "Publishing",
  "Bug Fixes",
];

export function generateStages(kind: ProjectKind) {
  return kind === "Game" ? gameStagePlan : websiteStagePlan;
}

type MilestoneDraft = {
  title: string;
  description: string;
  deliverables: string[];
  share: number;
};

const webMilestones: MilestoneDraft[] = [
  {
    title: "Discovery & Technical Blueprint",
    description: "Requirements, architecture and delivery plan agreed with the client.",
    deliverables: ["Requirements doc", "Architecture diagram", "Delivery plan"],
    share: 0.12,
  },
  {
    title: "UI/UX Design System",
    description: "Design tokens, key screens and an interactive prototype for sign-off.",
    deliverables: ["Design tokens", "Hi-fi screens", "Clickable prototype"],
    share: 0.18,
  },
  {
    title: "Frontend Build",
    description: "Routing, responsive layouts and component library wired to mock data.",
    deliverables: ["Component library", "All screens", "Responsive QA"],
    share: 0.25,
  },
  {
    title: "Backend, Auth & Database",
    description: "Schema, row-level security, authentication and business endpoints.",
    deliverables: ["Database schema", "Auth flows", "API endpoints"],
    share: 0.25,
  },
  {
    title: "QA, Deployment & Handover",
    description: "Regression testing, performance pass, production deploy and documentation.",
    deliverables: ["Test report", "Production deploy", "Handover docs"],
    share: 0.2,
  },
];

const gameMilestones: MilestoneDraft[] = [
  {
    title: "Concept, Story & Game Design Doc",
    description: "Core loop, narrative beats and the full game design document.",
    deliverables: ["Game design doc", "Story outline", "Core loop spec"],
    share: 0.12,
  },
  {
    title: "Characters, Art & Assets",
    description: "Character rigs, environment art and the asset pipeline.",
    deliverables: ["Character set", "Environment art", "Asset pipeline"],
    share: 0.2,
  },
  {
    title: "Gameplay & Physics",
    description: "Movement, combat/interaction systems, physics tuning and save system.",
    deliverables: ["Playable vertical slice", "Physics tuning", "Save system"],
    share: 0.28,
  },
  {
    title: "UI, Audio & Levels",
    description: "HUD, menus, sound design and the full level progression.",
    deliverables: ["HUD & menus", "Audio pass", "All levels"],
    share: 0.22,
  },
  {
    title: "Testing, Bug Fixes & Publishing",
    description: "Playtesting, bug burn-down, store assets and platform submission.",
    deliverables: ["Playtest report", "Bug burn-down", "Store build"],
    share: 0.18,
  },
];

export function generateMilestones(project: Project, kind = detectProjectKind(project)) {
  const plan = kind === "Game" ? gameMilestones : webMilestones;
  const span = Math.max(14, daysBetween(toDate(project.dueDate), toDate(project.startDate)));
  let cursor = 0;
  return plan.map((m, i) => {
    cursor += m.share;
    return {
      id: `${project.id}-auto-${i + 1}`,
      projectId: project.id,
      title: m.title,
      description: m.description,
      budget: Math.round(project.budget * m.share),
      deadline: addDays(project.startDate, Math.round(span * cursor)),
      stage: "Planning" as MilestoneStage,
      progress: 0,
      deliverables: m.deliverables.map((label) => ({ label, done: false })),
      files: [],
      completionDate: null,
      approval: "Not Submitted" as const,
    } satisfies Milestone;
  });
}

export function generateTasks(milestone: Pick<Milestone, "title" | "deliverables" | "deadline">) {
  return milestone.deliverables.map((d, i) => ({
    title: `${d} — ${milestone.title.split(" ")[0]}`,
    description: `Produce and review "${d}" so the milestone can move to testing.`,
    dueDate: addDays(milestone.deadline, -(milestone.deliverables.length - i) * 2),
    priority: i === 0 ? ("High" as const) : ("Medium" as const),
  }));
}

/* ------------------------------- Delivery pack -------------------------------- */

export function deliveryPack(project: Project, milestones: Milestone[], client?: Client) {
  const mine = milestones.filter((m) => m.projectId === project.id && m.stage !== "Cancelled");
  const deliverables = mine.flatMap((m) => m.deliverables.map((d) => d.label));
  const outstanding = mine.filter((m) => m.stage !== "Completed");
  return {
    ready: outstanding.length === 0,
    outstanding,
    summary: [
      `${project.name} has been delivered for ${client?.name ?? "the client"} across ${mine.length} milestones.`,
      `Scope covered: ${deliverables.slice(0, 6).join(", ")}.`,
      `Built with ${project.stack.join(", ")} and deployed from ${project.repository || "the project repository"}.`,
      `Total contracted value ${project.currency} ${project.budget.toLocaleString()} · ${project.actualHours}h delivered against ${project.estimatedHours}h estimated.`,
    ].join("\n\n"),
    testing: [
      "All primary user journeys pass on desktop and mobile",
      "Authentication, permissions and role guards verified",
      "Form validation and error states verified",
      "Responsive layout checked at 360 / 768 / 1280 / 1920",
      "Lighthouse performance and accessibility above 90",
      "Cross-browser check: Chrome, Safari, Firefox, Edge",
      "Data backups and environment variables documented",
      "No console errors or failing network requests",
    ],
    handover: [
      `Repository: ${project.repository || "provided on delivery"} — main branch is production.`,
      "Environment variables and secrets are documented in the project README.",
      "Deployment: push to main triggers the production build; rollbacks via the hosting dashboard.",
      "Admin credentials shared securely and rotated after handover.",
      "30 days of post-delivery bug support included; enhancements quoted separately.",
    ],
  };
}

/* ------------------------------ Portfolio draft -------------------------------- */

export function portfolioDraft(project: Project, client?: Client) {
  const kind = detectProjectKind(project);
  const industry = client?.company?.split(" ").slice(-1)[0] ?? "Technology";
  return {
    title: `${project.name} — ${kind} delivered end-to-end`,
    description: `${project.description} Delivered as a fixed-scope ${kind.toLowerCase()} engagement across ${project.estimatedHours} estimated hours, covering discovery, design, build, QA and deployment with weekly client demos.`,
    tags: [kind, ...project.stack.slice(0, 5)],
    software: [project.aiTool, "Visual Studio Code", "GitHub Desktop", "Node.js"].filter(Boolean),
    skills: [
      "Full-stack development",
      "UI/UX design",
      "API integration",
      "Database design",
      "Testing & QA",
      "Deployment",
    ],
    industry,
    images: [
      `${project.name} — dashboard overview`,
      `${project.name} — key workflow`,
      `${project.name} — mobile responsive views`,
    ],
  };
}
