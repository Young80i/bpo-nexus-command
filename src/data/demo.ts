export type ProjectStatus =
  | "Discovery"
  | "In Progress"
  | "Review"
  | "Waiting for Client"
  | "Completed"
  | "Archived";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export type Client = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  freelancerUsername: string;
  email: string;
  phone: string;
  company: string;
  totalProjects: number;
  totalRevenue: number;
  rating: number;
  notes: string;
  attachments: { name: string; size: string; type: string; date: string }[];
  since: string;
  status: "Active" | "Prospect" | "Dormant";
};

export type Project = {
  id: string;
  name: string;
  clientId: string;
  description: string;
  budget: number;
  currency: "USD" | "EUR" | "GBP" | "AUD";
  priority: Priority;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  stack: string[];
  repository: string;
  aiTool: string;
  notes: string;
  progress: number;
  archived: boolean;
};

export const clients: Client[] = [
  {
    id: "c1",
    name: "Marcus Feldman",
    country: "Germany",
    countryCode: "DE",
    freelancerUsername: "@mfeldman_de",
    email: "marcus@northbridge.io",
    phone: "+49 151 2233 4455",
    company: "Northbridge Logistics GmbH",
    totalProjects: 7,
    totalRevenue: 148500,
    rating: 4.9,
    notes:
      "Prefers weekly Friday demos. Very responsive on Freelancer chat. Pays milestones within 24h of release.",
    attachments: [
      { name: "northbridge-brand-kit.zip", size: "18.4 MB", type: "ZIP", date: "2026-05-02" },
      { name: "fleet-api-spec-v3.pdf", size: "1.2 MB", type: "PDF", date: "2026-06-11" },
    ],
    since: "2023-11-04",
    status: "Active",
  },
  {
    id: "c2",
    name: "Aisha Rahman",
    country: "United Arab Emirates",
    countryCode: "AE",
    freelancerUsername: "@aisha_rh",
    email: "aisha@zenithcapital.ae",
    phone: "+971 50 998 2210",
    company: "Zenith Capital Partners",
    totalProjects: 4,
    totalRevenue: 96200,
    rating: 4.7,
    notes: "Strict on security reviews. Requires NDA on every engagement. Timezone GST.",
    attachments: [{ name: "zenith-nda-signed.pdf", size: "640 KB", type: "PDF", date: "2026-01-19" }],
    since: "2024-06-21",
    status: "Active",
  },
  {
    id: "c3",
    name: "Daniel O'Sullivan",
    country: "Ireland",
    countryCode: "IE",
    freelancerUsername: "@dosullivan",
    email: "dan@shamrockhealth.ie",
    phone: "+353 87 441 7726",
    company: "Shamrock Health",
    totalProjects: 3,
    totalRevenue: 61400,
    rating: 4.4,
    notes: "HIPAA-adjacent data handling. Slow to approve scope changes — always confirm in writing.",
    attachments: [{ name: "patient-portal-wireframes.fig", size: "9.1 MB", type: "FIG", date: "2026-03-08" }],
    since: "2025-01-14",
    status: "Active",
  },
  {
    id: "c4",
    name: "Sofia Almeida",
    country: "Brazil",
    countryCode: "BR",
    freelancerUsername: "@sofia_alm",
    email: "sofia@mercadoflow.com.br",
    phone: "+55 11 96622 0187",
    company: "MercadoFlow",
    totalProjects: 5,
    totalRevenue: 78900,
    rating: 5.0,
    notes: "Repeat client, referral source. Loves detailed changelogs on each release.",
    attachments: [],
    since: "2024-02-27",
    status: "Active",
  },
  {
    id: "c5",
    name: "Kenji Watanabe",
    country: "Japan",
    countryCode: "JP",
    freelancerUsername: "@kwatanabe_jp",
    email: "kenji@orikami-labs.jp",
    phone: "+81 90 6644 1290",
    company: "Orikami Labs",
    totalProjects: 2,
    totalRevenue: 43800,
    rating: 4.6,
    notes: "Engineering-led buyer. Expects clean commits and architecture docs.",
    attachments: [{ name: "orikami-architecture.md", size: "82 KB", type: "MD", date: "2026-04-30" }],
    since: "2025-08-09",
    status: "Prospect",
  },
  {
    id: "c6",
    name: "Elena Vargas",
    country: "Spain",
    countryCode: "ES",
    freelancerUsername: "@elenavargas",
    email: "elena@casadigital.es",
    phone: "+34 622 118 340",
    company: "Casa Digital",
    totalProjects: 6,
    totalRevenue: 112300,
    rating: 4.8,
    notes: "Agency reseller — white-label all deliverables. Invoices monthly.",
    attachments: [{ name: "whitelabel-agreement.pdf", size: "410 KB", type: "PDF", date: "2025-12-02" }],
    since: "2023-07-18",
    status: "Active",
  },
  {
    id: "c7",
    name: "Grace Mensah",
    country: "Ghana",
    countryCode: "GH",
    freelancerUsername: "@gmensah",
    email: "grace@akwaabapay.com",
    phone: "+233 24 771 5508",
    company: "AkwaabaPay",
    totalProjects: 2,
    totalRevenue: 29750,
    rating: 4.2,
    notes: "Fintech compliance heavy. Budget-conscious, prefers fixed-price milestones.",
    attachments: [],
    since: "2025-10-01",
    status: "Dormant",
  },
  {
    id: "c8",
    name: "Tom Whitfield",
    country: "Australia",
    countryCode: "AU",
    freelancerUsername: "@twhitfield_au",
    email: "tom@reefanalytics.com.au",
    phone: "+61 412 660 903",
    company: "Reef Analytics",
    totalProjects: 3,
    totalRevenue: 67400,
    rating: 4.5,
    notes: "Data-heavy dashboards. Prefers async updates via Freelancer messages.",
    attachments: [{ name: "reef-dataset-sample.csv", size: "22 MB", type: "CSV", date: "2026-06-25" }],
    since: "2024-09-12",
    status: "Active",
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    name: "Fleet Telemetry Platform",
    clientId: "c1",
    description:
      "Real-time telemetry ingestion and driver-scoring dashboard for a 1,200-vehicle European logistics fleet.",
    budget: 48000,
    currency: "EUR",
    priority: "Critical",
    status: "In Progress",
    startDate: "2026-04-06",
    dueDate: "2026-08-14",
    estimatedHours: 640,
    actualHours: 471,
    stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "Redis"],
    repository: "github.com/bponexus/northbridge-fleet",
    aiTool: "Claude Code",
    notes: "Phase 2 covers predictive maintenance scoring. Hardware partner delivers OBD firmware in July.",
    progress: 68,
    archived: false,
  },
  {
    id: "p2",
    name: "Zenith Investor Portal",
    clientId: "c2",
    description: "Secure LP portal with document vault, capital-call workflows and quarterly reporting.",
    budget: 36500,
    currency: "USD",
    priority: "High",
    status: "Review",
    startDate: "2026-03-02",
    dueDate: "2026-08-02",
    estimatedHours: 480,
    actualHours: 452,
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    repository: "github.com/bponexus/zenith-portal",
    aiTool: "Lovable",
    notes: "Pen-test scheduled for the first week of August. Blocking final payment milestone.",
    progress: 88,
    archived: false,
  },
  {
    id: "p3",
    name: "Patient Intake Redesign",
    clientId: "c3",
    description: "Accessible patient onboarding flow with e-signature, insurance capture and triage routing.",
    budget: 22400,
    currency: "EUR",
    priority: "Medium",
    status: "Waiting for Client",
    startDate: "2026-05-11",
    dueDate: "2026-08-28",
    estimatedHours: 300,
    actualHours: 168,
    stack: ["React", "Remix", "Prisma", "PostgreSQL"],
    repository: "github.com/bponexus/shamrock-intake",
    aiTool: "GitHub Copilot",
    notes: "Awaiting clinical sign-off on triage question set — 9 days idle.",
    progress: 42,
    archived: false,
  },
  {
    id: "p4",
    name: "MercadoFlow Seller App",
    clientId: "c4",
    description: "Mobile-first seller console with inventory sync, payouts and Pix reconciliation.",
    budget: 31000,
    currency: "USD",
    priority: "High",
    status: "In Progress",
    startDate: "2026-05-25",
    dueDate: "2026-09-10",
    estimatedHours: 420,
    actualHours: 205,
    stack: ["React Native", "TypeScript", "Supabase", "Stripe"],
    repository: "github.com/bponexus/mercadoflow-seller",
    aiTool: "Cursor",
    notes: "Pix integration sandbox approved. Payout ledger needs an audit trail table.",
    progress: 47,
    archived: false,
  },
  {
    id: "p5",
    name: "Orikami Design System",
    clientId: "c5",
    description: "Component library, tokens and documentation site for Orikami's internal product suite.",
    budget: 18800,
    currency: "USD",
    priority: "Medium",
    status: "Discovery",
    startDate: "2026-07-06",
    dueDate: "2026-10-02",
    estimatedHours: 240,
    actualHours: 34,
    stack: ["React", "Storybook", "Tailwind", "Vite"],
    repository: "github.com/bponexus/orikami-ds",
    aiTool: "Claude Code",
    notes: "Token audit in progress. Client wants Figma variables kept as source of truth.",
    progress: 12,
    archived: false,
  },
  {
    id: "p6",
    name: "Casa Digital CMS Migration",
    clientId: "c6",
    description: "Migration of 42 white-label client sites from legacy WordPress to a headless stack.",
    budget: 54000,
    currency: "EUR",
    priority: "Critical",
    status: "In Progress",
    startDate: "2026-02-16",
    dueDate: "2026-08-08",
    estimatedHours: 720,
    actualHours: 618,
    stack: ["Next.js", "Sanity", "TypeScript", "Vercel"],
    repository: "github.com/bponexus/casa-headless",
    aiTool: "Cursor",
    notes: "31 of 42 sites migrated. Redirect map must be signed off before DNS cutover.",
    progress: 74,
    archived: false,
  },
  {
    id: "p7",
    name: "AkwaabaPay Merchant KYC",
    clientId: "c7",
    description: "Automated merchant onboarding with document OCR, sanctions screening and risk tiers.",
    budget: 16500,
    currency: "USD",
    priority: "High",
    status: "Waiting for Client",
    startDate: "2026-04-20",
    dueDate: "2026-08-20",
    estimatedHours: 260,
    actualHours: 149,
    stack: ["React", "Python", "FastAPI", "PostgreSQL"],
    repository: "github.com/bponexus/akwaaba-kyc",
    aiTool: "GitHub Copilot",
    notes: "Blocked on the client's sanctions-list vendor contract.",
    progress: 55,
    archived: false,
  },
  {
    id: "p8",
    name: "Reef Analytics Console",
    clientId: "c8",
    description: "Marine sensor analytics workspace with map layers, anomaly alerts and CSV pipelines.",
    budget: 29900,
    currency: "AUD",
    priority: "Medium",
    status: "Review",
    startDate: "2026-03-30",
    dueDate: "2026-08-05",
    estimatedHours: 360,
    actualHours: 341,
    stack: ["React", "TypeScript", "DuckDB", "Deck.gl"],
    repository: "github.com/bponexus/reef-console",
    aiTool: "Lovable",
    notes: "UAT feedback round 2 delivered. Two chart perf issues remain.",
    progress: 91,
    archived: false,
  },
  {
    id: "p9",
    name: "Northbridge Warehouse WMS",
    clientId: "c1",
    description: "Barcode-driven warehouse management module with pick-path optimisation.",
    budget: 41200,
    currency: "EUR",
    priority: "High",
    status: "Completed",
    startDate: "2025-10-13",
    dueDate: "2026-03-20",
    estimatedHours: 560,
    actualHours: 574,
    stack: ["React", "TypeScript", "NestJS", "PostgreSQL"],
    repository: "github.com/bponexus/northbridge-wms",
    aiTool: "Cursor",
    notes: "Delivered 4 days late due to scanner hardware delays. Client rated 5/5.",
    progress: 100,
    archived: false,
  },
  {
    id: "p10",
    name: "Zenith Deal Room",
    clientId: "c2",
    description: "Virtual data room with granular permissions and watermarked document viewing.",
    budget: 27600,
    currency: "USD",
    priority: "Medium",
    status: "Completed",
    startDate: "2025-09-01",
    dueDate: "2026-01-30",
    estimatedHours: 380,
    actualHours: 366,
    stack: ["Next.js", "TypeScript", "Supabase", "AWS S3"],
    repository: "github.com/bponexus/zenith-dealroom",
    aiTool: "Lovable",
    notes: "Handed over with runbook. Maintenance retainer under discussion.",
    progress: 100,
    archived: false,
  },
  {
    id: "p11",
    name: "MercadoFlow Storefront v1",
    clientId: "c4",
    description: "Headless storefront with Portuguese localisation and marketplace checkout.",
    budget: 23400,
    currency: "USD",
    priority: "Low",
    status: "Completed",
    startDate: "2025-06-02",
    dueDate: "2025-11-14",
    estimatedHours: 320,
    actualHours: 311,
    stack: ["Next.js", "Tailwind", "Medusa"],
    repository: "github.com/bponexus/mercadoflow-store",
    aiTool: "GitHub Copilot",
    notes: "Superseded by the seller app engagement.",
    progress: 100,
    archived: false,
  },
  {
    id: "p12",
    name: "Casa Digital Legacy Audit",
    clientId: "c6",
    description: "Technical audit of legacy PHP estate ahead of the migration programme.",
    budget: 8600,
    currency: "EUR",
    priority: "Low",
    status: "Archived",
    startDate: "2025-11-10",
    dueDate: "2025-12-19",
    estimatedHours: 120,
    actualHours: 118,
    stack: ["PHP", "MySQL"],
    repository: "github.com/bponexus/casa-audit",
    aiTool: "Claude Code",
    notes: "Findings folded into the migration statement of work.",
    progress: 100,
    archived: true,
  },
];

export const statusOrder: ProjectStatus[] = [
  "Discovery",
  "In Progress",
  "Review",
  "Waiting for Client",
  "Completed",
];

export const priorities: Priority[] = ["Low", "Medium", "High", "Critical"];

export const revenueSeries = [
  { month: "Feb", revenue: 41200, target: 38000 },
  { month: "Mar", revenue: 52800, target: 44000 },
  { month: "Apr", revenue: 47600, target: 48000 },
  { month: "May", revenue: 61300, target: 52000 },
  { month: "Jun", revenue: 58900, target: 56000 },
  { month: "Jul", revenue: 72400, target: 60000 },
];

export const milestoneSeries = [
  { month: "Feb", completed: 9, planned: 12 },
  { month: "Mar", completed: 14, planned: 15 },
  { month: "Apr", completed: 11, planned: 14 },
  { month: "May", completed: 18, planned: 18 },
  { month: "Jun", completed: 16, planned: 20 },
  { month: "Jul", completed: 21, planned: 22 },
];

export const productivitySeries = [
  { day: "Mon", hours: 46, tasks: 18 },
  { day: "Tue", hours: 52, tasks: 24 },
  { day: "Wed", hours: 49, tasks: 21 },
  { day: "Thu", hours: 57, tasks: 27 },
  { day: "Fri", hours: 44, tasks: 19 },
  { day: "Sat", hours: 18, tasks: 6 },
  { day: "Sun", hours: 9, tasks: 3 },
];

export const upcomingDeadlines = [
  { id: "d1", project: "Reef Analytics Console", client: "Reef Analytics", date: "2026-08-05", days: 7 },
  { id: "d2", project: "Zenith Investor Portal", client: "Zenith Capital", date: "2026-08-02", days: 4 },
  { id: "d3", project: "Casa Digital CMS Migration", client: "Casa Digital", date: "2026-08-08", days: 10 },
  { id: "d4", project: "Fleet Telemetry Platform", client: "Northbridge Logistics", date: "2026-08-14", days: 16 },
  { id: "d5", project: "AkwaabaPay Merchant KYC", client: "AkwaabaPay", date: "2026-08-20", days: 22 },
];

export const recentMessages = [
  {
    id: "m1",
    client: "Marcus Feldman",
    initials: "MF",
    preview: "The driver-scoring view looks sharp. Can we add a CSV export before the demo?",
    time: "12m ago",
    unread: true,
  },
  {
    id: "m2",
    client: "Sofia Almeida",
    initials: "SA",
    preview: "Pix sandbox credentials are in the shared vault — go ahead with reconciliation.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "m3",
    client: "Aisha Rahman",
    initials: "AR",
    preview: "Security team scheduled the pen test for Aug 3. Please freeze deploys that day.",
    time: "3h ago",
    unread: false,
  },
  {
    id: "m4",
    client: "Tom Whitfield",
    initials: "TW",
    preview: "Round 2 UAT notes attached. Mostly chart performance on the 90-day range.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "m5",
    client: "Elena Vargas",
    initials: "EV",
    preview: "Client 31 signed off. Redirect map for the last batch comes Monday.",
    time: "Yesterday",
    unread: false,
  },
];

export const recentActivity = [
  { id: "a1", type: "milestone", text: "Milestone 4 released on Zenith Investor Portal", who: "Priya N.", time: "24m ago" },
  { id: "a2", type: "payment", text: "Payment of €12,400 cleared from Northbridge Logistics", who: "System", time: "1h ago" },
  { id: "a3", type: "task", text: "18 tasks moved to Review on Casa Digital CMS Migration", who: "Andrés L.", time: "2h ago" },
  { id: "a4", type: "client", text: "New client Orikami Labs added from Freelancer.com", who: "You", time: "5h ago" },
  { id: "a5", type: "file", text: "reef-dataset-sample.csv uploaded to Reef Analytics Console", who: "Tom W.", time: "8h ago" },
  { id: "a6", type: "project", text: "MercadoFlow Seller App moved to In Progress", who: "Priya N.", time: "Yesterday" },
];

export const currencySymbol: Record<Project["currency"], string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
};

export function formatMoney(value: number, currency: Project["currency"] = "USD") {
  return `${currencySymbol[currency]}${value.toLocaleString("en-US")}`;
}
