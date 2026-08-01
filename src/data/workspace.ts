import { projects } from "./demo";

/* ---------------------------------- Milestones --------------------------------- */

export const milestoneStages = [
  "Planning",
  "In Progress",
  "Testing",
  "Waiting Approval",
  "Completed",
  "Cancelled",
] as const;

export type MilestoneStage = (typeof milestoneStages)[number];
export type ApprovalStatus = "Not Submitted" | "Pending" | "Approved" | "Changes Requested" | "Rejected";

export type MilestoneFile = { name: string; size: string; type: string };

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  stage: MilestoneStage;
  progress: number;
  deliverables: { label: string; done: boolean }[];
  files: MilestoneFile[];
  completionDate: string | null;
  approval: ApprovalStatus;
};

const stagePlan: {
  title: string;
  description: string;
  deliverables: string[];
  files: MilestoneFile[];
}[] = [
  {
    title: "Discovery & Technical Blueprint",
    description: "Requirement workshops, architecture blueprint and delivery plan signed off with the client.",
    deliverables: ["Requirements doc", "System architecture diagram", "Sprint plan"],
    files: [{ name: "architecture-blueprint.pdf", size: "2.1 MB", type: "PDF" }],
  },
  {
    title: "UI/UX Design System",
    description: "High-fidelity screens, component library and interactive prototype for client review.",
    deliverables: ["Wireframes", "Hi-fi screens", "Clickable prototype"],
    files: [{ name: "design-system.fig", size: "14.6 MB", type: "FIG" }],
  },
  {
    title: "Core Application Build",
    description: "Frontend build with routing, state management and integration against the staging API.",
    deliverables: ["Frontend shell", "Core modules", "Staging deploy"],
    files: [{ name: "build-notes-v1.md", size: "48 KB", type: "MD" }],
  },
  {
    title: "Backend, Auth & Database",
    description: "Schema, row-level security, authentication flows and business logic endpoints.",
    deliverables: ["Database schema", "Auth flows", "REST endpoints"],
    files: [{ name: "schema.sql", size: "96 KB", type: "SQL" }],
  },
  {
    title: "QA, Hardening & Handover",
    description: "Regression suite, performance tuning, documentation and production cutover.",
    deliverables: ["Test report", "Runbook", "Production deploy"],
    files: [{ name: "qa-report.xlsx", size: "780 KB", type: "XLSX" }],
  },
];

function stageFor(projectProgress: number, index: number, total: number): MilestoneStage {
  const share = ((index + 1) / total) * 100;
  if (projectProgress >= share) return "Completed";
  if (projectProgress >= share - 100 / total) {
    if (projectProgress >= share - 6) return "Waiting Approval";
    if (projectProgress >= share - 12) return "Testing";
    return "In Progress";
  }
  return "Planning";
}

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const milestones: Milestone[] = projects.flatMap((project) => {
  const span = Math.max(
    30,
    Math.round(
      (new Date(project.dueDate).getTime() - new Date(project.startDate).getTime()) / 86400000,
    ),
  );
  return stagePlan.map((plan, i) => {
    const stage = project.archived
      ? i > 2
        ? "Cancelled"
        : "Completed"
      : stageFor(project.progress, i, stagePlan.length);
    const progress =
      stage === "Completed" ? 100 : stage === "Cancelled" ? 0 : stage === "Waiting Approval" ? 95 : stage === "Testing" ? 78 : stage === "In Progress" ? 45 : 0;
    const deadline = addDays(project.startDate, Math.round((span / stagePlan.length) * (i + 1)));
    return {
      id: `${project.id}-m${i + 1}`,
      projectId: project.id,
      title: plan.title,
      description: plan.description,
      budget: Math.round((project.budget / stagePlan.length) * (i === 4 ? 1.2 : i === 0 ? 0.8 : 1)),
      deadline,
      stage,
      progress,
      deliverables: plan.deliverables.map((label, di) => ({
        label,
        done: stage === "Completed" || (progress > 0 && di < Math.floor((progress / 100) * plan.deliverables.length)),
      })),
      files: plan.files,
      completionDate: stage === "Completed" ? addDays(deadline, -2) : null,
      approval:
        stage === "Completed"
          ? "Approved"
          : stage === "Waiting Approval"
            ? "Pending"
            : stage === "Cancelled"
              ? "Rejected"
              : "Not Submitted",
    } satisfies Milestone;
  });
});

export function projectCompletion(list: Milestone[]) {
  const active = list.filter((m) => m.stage !== "Cancelled");
  if (!active.length) return 0;
  return Math.round(active.reduce((sum, m) => sum + m.progress, 0) / active.length);
}

/* -------------------------------- Conversations -------------------------------- */

export type MessageKind = "client" | "team" | "note";

export type MessageStatus = "Sent" | "Delivered" | "Read" | "Draft";

export type Message = {
  id: string;
  conversationId: string;
  kind: MessageKind;
  author: string;
  initials: string;
  body: string;
  time: string;
  attachments?: { name: string; size: string }[];
  unread?: boolean;
  status?: MessageStatus;
  createdAt?: string;
  edited?: boolean;
};


export type Conversation = {
  id: string;
  projectId: string;
  subject: string;
  channel: "Freelancer Chat" | "Email" | "Internal";
  starred: boolean;
  aiSummary: string;
  aiReply: string;
};

const convoSeeds: {
  projectId: string;
  subject: string;
  channel: Conversation["channel"];
  starred: boolean;
  summary: string;
  reply: string;
  msgs: [MessageKind, string, string, string, boolean?][];
}[] = [
  {
    projectId: "p1",
    subject: "Driver scoring dashboard — feedback round 3",
    channel: "Freelancer Chat",
    starred: true,
    summary:
      "Marcus approved the scoring visuals but wants CSV export before Friday's board demo. One open question about time-zone handling on the 30-day chart.",
    reply:
      "Hi Marcus — glad the scoring view landed well. CSV export is straightforward; we'll ship it to staging by Thursday 17:00 CET so you have a full day before the board demo. On the 30-day chart we'll normalise timestamps to fleet-local time and label the axis accordingly. Anything else you'd like in the export beyond score, driver ID and trip count?",
    msgs: [
      ["client", "Marcus Feldman", "The driver-scoring view looks sharp. Can we add a CSV export before the demo?", "12m ago", true],
      ["client", "Marcus Feldman", "Also — is the 30-day chart in UTC or fleet-local time? Board will ask.", "10m ago", true],
      ["note", "You", "Export lib already bundled. ~2h of work. Confirm columns with Priya before promising Thursday.", "8m ago"],
      ["team", "Priya N.", "Columns are ready on the analytics endpoint, we just need the download handler.", "5m ago"],
    ],
  },
  {
    projectId: "p2",
    subject: "Pen test window & deploy freeze",
    channel: "Email",
    starred: false,
    summary:
      "Zenith's security team locked the pen test for Aug 3. They require a deploy freeze that day and a fresh staging snapshot 24h prior.",
    reply:
      "Hi Aisha — noted, we'll freeze all deploys on Aug 3 and take a staging snapshot on Aug 2 at 18:00 GST. I'll share the environment credentials and a scoped test account with your security lead the same evening. We'll keep the team on standby for any critical findings.",
    msgs: [
      ["client", "Aisha Rahman", "Security team scheduled the pen test for Aug 3. Please freeze deploys that day.", "3h ago", true],
      ["note", "You", "Move milestone 5 release to Aug 4 in the plan. Payment milestone depends on the report.", "2h ago"],
      ["team", "Andrés L.", "Snapshot job is scripted, I'll schedule it for Aug 2 18:00 GST.", "1h ago"],
    ],
  },
  {
    projectId: "p4",
    subject: "Pix reconciliation — sandbox credentials",
    channel: "Freelancer Chat",
    starred: true,
    summary:
      "Sofia shared sandbox credentials and approved starting the reconciliation ledger. She wants a changelog entry for every release.",
    reply:
      "Obrigado Sofia! We've picked up the sandbox credentials and started the reconciliation ledger with a full audit trail table. Every release from now on ships with a changelog entry in the shared doc — first one lands with milestone 3.",
    msgs: [
      ["client", "Sofia Almeida", "Pix sandbox credentials are in the shared vault — go ahead with reconciliation.", "1h ago", true],
      ["client", "Sofia Almeida", "Please keep the changelog detailed, our finance team reads it.", "58m ago"],
      ["team", "Rafael M.", "Ledger table migration is drafted, adding audit columns now.", "40m ago"],
    ],
  },
  {
    projectId: "p8",
    subject: "UAT round 2 — chart performance",
    channel: "Email",
    starred: false,
    summary:
      "Tom's UAT notes are mostly positive; two performance issues on the 90-day range remain before sign-off.",
    reply:
      "Thanks Tom — we reproduced both slow-downs on the 90-day range. We're moving aggregation server-side and virtualising the layer list, which should bring render under 400ms. Fix ships to UAT tomorrow for a final pass.",
    msgs: [
      ["client", "Tom Whitfield", "Round 2 UAT notes attached. Mostly chart performance on the 90-day range.", "Yesterday"],
      ["note", "You", "Profile deck.gl layer re-renders — suspect the anomaly overlay recalculates on every pan.", "Yesterday"],
    ],
  },
  {
    projectId: "p6",
    subject: "Redirect map sign-off for final batch",
    channel: "Freelancer Chat",
    starred: false,
    summary: "Elena confirmed site 31 sign-off. Redirect map for the last batch arrives Monday, blocking DNS cutover.",
    reply:
      "Perfect, Elena. We'll stage the last batch behind the redirect map as soon as it lands Monday and run the crawl diff before cutover so nothing 404s for your white-label clients.",
    msgs: [
      ["client", "Elena Vargas", "Client 31 signed off. Redirect map for the last batch comes Monday.", "Yesterday"],
      ["team", "Andrés L.", "Crawl diff script is ready — we can validate 42 sites in about 20 minutes.", "Yesterday"],
    ],
  },
  {
    projectId: "p3",
    subject: "Clinical sign-off on triage questions",
    channel: "Email",
    starred: false,
    summary: "Nine days idle waiting on clinical sign-off. Suggest a nudge with a decision deadline attached.",
    reply:
      "Hi Daniel — checking in on the triage question set. We're holding development capacity for this and can restart within a day of sign-off. Could we agree on Friday as a decision date so the August delivery window stays intact?",
    msgs: [
      ["note", "You", "9 days idle. Escalate — this now threatens the August delivery window.", "2d ago"],
      ["client", "Daniel O'Sullivan", "Clinical lead is back from leave Thursday, will review then.", "2d ago"],
    ],
  },
];

export const conversations: Conversation[] = convoSeeds.map((c, i) => ({
  id: `cv${i + 1}`,
  projectId: c.projectId,
  subject: c.subject,
  channel: c.channel,
  starred: c.starred,
  aiSummary: c.summary,
  aiReply: c.reply,
}));

export const messages: Message[] = convoSeeds.flatMap((c, i) =>
  c.msgs.map(([kind, author, body, time, unread], mi) => ({
    id: `cv${i + 1}-msg${mi + 1}`,
    conversationId: `cv${i + 1}`,
    kind,
    author,
    initials: author
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    body,
    time,
    unread: Boolean(unread),
    attachments:
      mi === 0 && i === 3 ? [{ name: "uat-round-2-notes.pdf", size: "1.4 MB" }] : undefined,
  })),
);

/* -------------------------------- AI Workspace --------------------------------- */

export const promptTools = ["Claude", "Lovable", "Base44"] as const;
export type PromptTool = (typeof promptTools)[number];

export type PromptVersion = { version: string; body: string; date: string; note: string };

export type Prompt = {
  id: string;
  projectId: string;
  title: string;
  tool: PromptTool;
  group: string;
  tags: string[];
  body: string;
  codeNotes: string;
  versions: PromptVersion[];
  updated: string;
  status?: "Draft" | "Active" | "Archived";
  created?: string;
};


export const prompts: Prompt[] = [
  {
    id: "pr1",
    projectId: "p1",
    title: "Telemetry ingestion service scaffold",
    tool: "Claude",
    group: "Backend",
    tags: ["architecture", "node", "kafka"],
    body: "You are a senior backend engineer. Design and scaffold a telemetry ingestion service that accepts 1,200 vehicles emitting OBD payloads every 5 seconds. Requirements: idempotent ingest, back-pressure handling, Postgres time-series partitioning by day, and a Redis hot cache for the last 15 minutes per vehicle. Output the folder structure first, then the core files with inline comments.",
    codeNotes:
      "Generated a clean partitioning migration but forgot the retention job — added a pg_cron task manually. Redis key design (fleet:{id}:latest) kept as-is.",
    versions: [
      { version: "v3", body: "Added back-pressure + retention requirements to the brief.", date: "2026-07-18", note: "Current" },
      { version: "v2", body: "Added Redis hot-cache requirement.", date: "2026-06-29", note: "Cache layer" },
      { version: "v1", body: "Initial ingestion scaffold brief.", date: "2026-05-12", note: "First draft" },
    ],
    updated: "2026-07-18",
  },
  {
    id: "pr2",
    projectId: "p1",
    title: "Driver scoring dashboard UI",
    tool: "Lovable",
    group: "Frontend",
    tags: ["dashboard", "recharts"],
    body: "Build a driver-scoring dashboard page: KPI row (fleet score, harsh braking events, idle time, fuel index), a 30-day score trend area chart, a sortable driver leaderboard with search, and a slide-over driver detail panel. Use semantic design tokens, dark mode support, and a dense executive layout.",
    codeNotes: "Leaderboard virtualisation added by hand for 1,200 rows. Chart axis labels needed extra left margin.",
    versions: [
      { version: "v2", body: "Added slide-over detail panel and search.", date: "2026-07-09", note: "Current" },
      { version: "v1", body: "KPI row + trend chart only.", date: "2026-06-02", note: "MVP" },
    ],
    updated: "2026-07-09",
  },
  {
    id: "pr3",
    projectId: "p2",
    title: "Capital call workflow state machine",
    tool: "Claude",
    group: "Backend",
    tags: ["workflow", "fintech"],
    body: "Model a capital-call workflow as an explicit state machine: draft → issued → partially funded → funded → closed, with side effects for notifications, document generation and audit logging at every transition. Provide TypeScript types, a transition guard table, and unit tests for illegal transitions.",
    codeNotes: "Guard table was excellent. Had to swap generated PDF lib for a Worker-compatible one.",
    versions: [
      { version: "v2", body: "Added audit logging and illegal-transition tests.", date: "2026-06-21", note: "Current" },
      { version: "v1", body: "Base state machine only.", date: "2026-04-18", note: "Draft" },
    ],
    updated: "2026-06-21",
  },
  {
    id: "pr4",
    projectId: "p2",
    title: "LP document vault permissions",
    tool: "Base44",
    group: "Security",
    tags: ["rls", "permissions"],
    body: "Generate a granular permission model for an LP document vault: fund-level, LP-level and document-level access, watermarking rules per viewer, and download restrictions. Express as Postgres RLS policies with a security-definer role check function.",
    codeNotes: "RLS policies solid. Watermark rules moved to the render layer instead of the database.",
    versions: [{ version: "v1", body: "Initial permission model brief.", date: "2026-05-30", note: "Current" }],
    updated: "2026-05-30",
  },
  {
    id: "pr5",
    projectId: "p4",
    title: "Pix reconciliation ledger",
    tool: "Claude",
    group: "Backend",
    tags: ["payments", "ledger"],
    body: "Design a double-entry reconciliation ledger for Pix payouts: immutable entries, settlement matching against bank statements, exception queue for unmatched items, and a daily close routine. Include the schema, matching algorithm and edge cases for partial refunds.",
    codeNotes: "Matching algorithm handled partial refunds well; added a manual override table for finance.",
    versions: [
      { version: "v2", body: "Added exception queue + daily close.", date: "2026-07-21", note: "Current" },
      { version: "v1", body: "Ledger schema only.", date: "2026-06-14", note: "Draft" },
    ],
    updated: "2026-07-21",
  },
  {
    id: "pr6",
    projectId: "p4",
    title: "Seller console mobile shell",
    tool: "Lovable",
    group: "Frontend",
    tags: ["mobile", "navigation"],
    body: "Create a mobile-first seller console shell: bottom tab navigation (Home, Orders, Inventory, Payouts, More), pull-to-refresh, offline banner, and skeleton loading states. Portuguese copy, thumb-friendly targets, and smooth page transitions.",
    codeNotes: "Offline banner reused across the app. Transitions tuned to 220ms for a snappier feel.",
    versions: [{ version: "v1", body: "Initial shell brief.", date: "2026-06-08", note: "Current" }],
    updated: "2026-06-08",
  },
  {
    id: "pr7",
    projectId: "p6",
    title: "WordPress → headless content mapper",
    tool: "Base44",
    group: "Migration",
    tags: ["cms", "migration"],
    body: "Write a migration mapper that converts legacy WordPress post/page/ACF structures into a headless content model. Handle shortcodes, inline images, redirects and taxonomy flattening. Produce a dry-run report before writing anything.",
    codeNotes: "Dry-run report saved us twice. Shortcode coverage needed 6 custom handlers.",
    versions: [
      { version: "v3", body: "Added redirect map generation.", date: "2026-07-02", note: "Current" },
      { version: "v2", body: "Added taxonomy flattening rules.", date: "2026-05-19", note: "Taxonomies" },
      { version: "v1", body: "Base mapper brief.", date: "2026-03-11", note: "Draft" },
    ],
    updated: "2026-07-02",
  },
  {
    id: "pr8",
    projectId: "p8",
    title: "Anomaly detection copy & thresholds",
    tool: "Claude",
    group: "Data",
    tags: ["analytics", "alerts"],
    body: "Given marine sensor time-series (temperature, turbidity, salinity), propose anomaly thresholds with seasonal adjustment, and write concise alert copy for each severity tier that a non-technical operator understands.",
    codeNotes: "Seasonal adjustment logic ported directly. Alert copy used verbatim in the UI.",
    versions: [{ version: "v1", body: "Initial thresholds brief.", date: "2026-06-27", note: "Current" }],
    updated: "2026-06-27",
  },
];

/* ---------------------------- Website Development ------------------------------ */

export const devStages = [
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
] as const;

export type DevStage = (typeof devStages)[number];

export type StageProgress = { stage: DevStage; progress: number; owner: string; note: string };

const owners = ["Priya N.", "Andrés L.", "Rafael M.", "You", "Mei T."];

export const devTracks: Record<string, StageProgress[]> = Object.fromEntries(
  projects.map((project) => {
    const weights = [1.35, 1.25, 1.05, 1.0, 1.0, 1.05, 0.95, 0.8, 0.6, 0.5];
    return [
      project.id,
      devStages.map((stage, i) => ({
        stage,
        progress: Math.max(0, Math.min(100, Math.round(project.progress * weights[i]))),
        owner: owners[i % owners.length],
        note:
          i === 0
            ? "Scope, estimates and delivery plan agreed with the client."
            : `${stage} workstream tracked against milestone ${Math.min(5, Math.floor(i / 2) + 1)}.`,
      })),
    ];
  }),
);
