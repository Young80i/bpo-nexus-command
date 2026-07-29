import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FolderKanban,
  MessageSquarePlus,
  Plus,
  Timer,
  TrendingUp,
  UserPlus,
  Wallet,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { PriorityBadge, ProgressBar, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import {
  clients,
  formatMoney,
  milestoneSeries,
  productivitySeries,
  projects,
  recentActivity,
  recentMessages,
  revenueSeries,
  upcomingDeadlines,
} from "@/data/demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — BPO Nexus" },
      {
        name: "description",
        content:
          "AI-powered delivery command center for software outsourcing: revenue, pipeline, deadlines and client signals in one executive view.",
      },
      { property: "og:title", content: "Executive Dashboard — BPO Nexus" },
      {
        property: "og:description",
        content: "Track revenue, projects, milestones and client conversations across your outsourcing pipeline.",
      },
    ],
  }),
  component: Dashboard,
});

const kpis = [
  { label: "Total Projects", value: "12", delta: "+3 this quarter", icon: FolderKanban, tone: "text-primary" },
  { label: "In Progress", value: "4", delta: "2 at risk", icon: Timer, tone: "text-info" },
  { label: "Completed", value: "3", delta: "100% on-spec", icon: CheckCircle2, tone: "text-success" },
  { label: "Waiting for Client", value: "2", delta: "9 days idle avg", icon: Clock3, tone: "text-destructive" },
  { label: "Total Revenue", value: "$638,250", delta: "+18.4% YoY", icon: Wallet, tone: "text-primary" },
  { label: "Monthly Revenue", value: "$72,400", delta: "+22.9% MoM", icon: TrendingUp, tone: "text-success" },
];

const quickActions = [
  { label: "New Project", icon: Plus },
  { label: "Add Client", icon: UserPlus },
  { label: "Log Milestone", icon: CalendarClock },
  { label: "Draft Reply", icon: MessageSquarePlus },
  { label: "AI Status Digest", icon: Zap },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-muted-foreground">
          {p.name}: <span className="font-semibold text-foreground">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

function Dashboard() {
  const highPriority = projects
    .filter((p) => (p.priority === "Critical" || p.priority === "High") && p.status !== "Completed" && !p.archived)
    .slice(0, 4);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description="Wednesday, 29 July 2026 · Delivery health across 8 clients and 12 engagements"
        actions={
          <>
            <Button variant="outline" size="sm">
              Export report
            </Button>
            <Button size="sm" className="gap-1.5">
              <Zap className="h-4 w-4" /> AI Weekly Digest
            </Button>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="surface-card lift p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <kpi.icon className={`h-4 w-4 shrink-0 ${kpi.tone}`} />
            </div>
            <p className="mt-3 font-display text-2xl font-bold tracking-tight">{kpi.value}</p>
            <p className="mt-1 truncate text-[0.72rem] text-muted-foreground">{kpi.delta}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="surface-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Revenue vs Target</h2>
              <p className="text-xs text-muted-foreground">Last 6 months, all currencies normalised to USD</p>
            </div>
            <span className="rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">+22.9%</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueSeries} margin={{ left: -6, right: 6, top: 6 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--muted-foreground)"
                tickFormatter={(v: number) => `$${v / 1000}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#rev)"
              />
              <Line type="monotone" dataKey="target" name="Target" stroke="var(--chart-2)" strokeDasharray="5 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <p className="text-xs text-muted-foreground">Most-used delivery operations</p>
          <div className="mt-4 grid gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg brand-gradient text-primary-foreground">
                  <action.icon className="h-4 w-4" />
                </span>
                <span className="truncate">{action.label}</span>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Milestone Completion</h2>
          <p className="mb-3 text-xs text-muted-foreground">Completed vs planned per month</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={milestoneSeries} margin={{ left: -22, right: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
              <Bar dataKey="planned" name="Planned" fill="var(--surface-2)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" name="Completed" radius={[6, 6, 0, 0]}>
                {milestoneSeries.map((entry) => (
                  <Cell key={entry.month} fill="var(--chart-1)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Weekly Productivity</h2>
          <p className="mb-3 text-xs text-muted-foreground">Team hours logged and tasks shipped</p>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={productivitySeries} margin={{ left: -22, right: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="hours" name="Hours" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="tasks" name="Tasks" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Project Progress</h2>
          <p className="mb-4 text-xs text-muted-foreground">Active engagements by completion</p>
          <div className="space-y-4">
            {projects
              .filter((p) => p.status !== "Completed" && !p.archived)
              .slice(0, 6)
              .map((p) => (
                <div key={p.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-medium">{p.name}</span>
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="surface-card p-5">
          <h2 className="mb-4 text-base font-semibold">Upcoming Deadlines</h2>
          <ul className="space-y-3">
            {upcomingDeadlines.map((d) => (
              <li key={d.id} className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[0.7rem] font-bold ${
                    d.days <= 7 ? "bg-destructive/12 text-destructive" : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {d.days}d
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.project}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.client}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{d.date.slice(5)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Client Messages</h2>
            <Link to="/conversations" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-3.5">
            {recentMessages.map((m) => (
              <li key={m.id} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[0.7rem] font-bold">
                  {m.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{m.client}</p>
                    {m.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <span className="ml-auto shrink-0 text-[0.7rem] text-muted-foreground">{m.time}</span>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{m.preview}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-base font-semibold">Recent Activity</h2>
          <ul className="space-y-4">
            {recentActivity.map((a, i) => (
              <li key={a.id} className="relative flex gap-3 pl-1">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full brand-gradient" />
                {i !== recentActivity.length - 1 && (
                  <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
                )}
                <div className="min-w-0">
                  <p className="text-xs leading-relaxed">{a.text}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                    {a.who} · {a.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">High Priority Projects</h2>
            <p className="text-xs text-muted-foreground">Critical and high-priority engagements needing attention</p>
          </div>
          <Link to="/projects" className="shrink-0 text-xs font-semibold text-primary hover:underline">
            Open board
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {highPriority.map((p) => {
            const client = clients.find((c) => c.id === p.clientId);
            return (
              <div key={p.id} className="lift rounded-xl border border-border bg-surface-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold">{p.name}</p>
                  <PriorityBadge priority={p.priority} />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{client?.company}</p>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={p.status} />
                  <span className="shrink-0 font-semibold text-foreground">{formatMoney(p.budget, p.currency)}</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={p.progress} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
