import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bot,
  Clock3,
  Repeat2,
  Smile,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/demo";
import {
  aiTrend,
  aiUsage,
  analyticsData,
  analyticsRanges,
  projectTypeMix,
  type AnalyticsRange,
} from "@/data/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Executive Analytics — Revenue, Win Rate & AI Usage | BPO Nexus" },
      {
        name: "description",
        content:
          "Executive reporting on revenue, completed projects, average completion time, win rate, revision rate, client satisfaction, project mix and AI usage.",
      },
      { property: "og:title", content: "Executive Analytics — BPO Nexus" },
      { property: "og:description", content: "Filterable executive dashboards for outsourcing delivery performance." },
    ],
  }),
  component: AnalyticsPage,
});

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey ?? p.name} className="text-muted-foreground">
          {p.name}: <span className="font-semibold text-foreground">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("12m");
  const [typeFilter, setTypeFilter] = useState("all");
  const data = analyticsData[range];

  const typeMix = useMemo(
    () => (typeFilter === "all" ? projectTypeMix : projectTypeMix.filter((t) => t.type === typeFilter)),
    [typeFilter],
  );

  const kpis = [
    { label: "Total Revenue", value: `$${data.revenue.toLocaleString()}`, sub: "normalised to USD", icon: Wallet, tone: "text-primary" },
    { label: "Monthly Revenue", value: `$${data.monthlyRevenue.toLocaleString()}`, sub: "run-rate average", icon: TrendingUp, tone: "text-success" },
    { label: "Completed Projects", value: String(data.completedProjects), sub: `${projects.length} total engagements`, icon: Trophy, tone: "text-info" },
    { label: "Avg Completion Time", value: `${data.avgCompletionDays} days`, sub: "kickoff to handover", icon: Clock3, tone: "text-warning" },
    { label: "Win Rate", value: `${data.winRate}%`, sub: "proposals converted", icon: Target, tone: "text-primary" },
    { label: "Revision Rate", value: `${data.revisionRate}%`, sub: "milestones reworked", icon: Repeat2, tone: "text-destructive" },
    { label: "Client Satisfaction", value: `${data.satisfaction.toFixed(1)} / 5`, sub: "post-delivery survey", icon: Smile, tone: "text-success" },
    { label: "AI Hours Saved", value: `${aiUsage.reduce((s, a) => s + a.hoursSaved, 0)}h`, sub: "across Claude, Lovable, Base44", icon: Bot, tone: "text-info" },
  ];

  const satisfactionGauge = [{ name: "Satisfaction", value: (data.satisfaction / 5) * 100, fill: "var(--chart-1)" }];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Executive Analytics"
        description="Margin, velocity, conversion and AI leverage across the delivery portfolio"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="all">All project types</option>
              {projectTypeMix.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.type}
                </option>
              ))}
            </select>
            <div className="inline-flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
              {analyticsRanges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    range === r ? "bg-background text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              Export board pack
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="surface-card lift p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-medium text-muted-foreground">{k.label}</p>
              <k.icon className={`h-4 w-4 shrink-0 ${k.tone}`} />
            </div>
            <p className="mt-3 font-display text-2xl font-bold tracking-tight">{k.value}</p>
            <p className="mt-1 truncate text-[0.72rem] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="surface-card p-5 xl:col-span-2">
          <h2 className="text-base font-semibold">Revenue vs Target</h2>
          <p className="mb-3 text-xs text-muted-foreground">Booked revenue against plan for the selected range</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenueSeries} margin={{ left: 4, right: 6, top: 6 }}>
              <defs>
                <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={52}
                stroke="var(--muted-foreground)"
                tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#ar)" />
              <Line type="monotone" dataKey="target" name="Target" stroke="var(--chart-2)" strokeDasharray="5 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Client Satisfaction</h2>
          <p className="mb-1 text-xs text-muted-foreground">Average post-delivery score</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart innerRadius="72%" outerRadius="100%" data={satisfactionGauge} startAngle={210} endAngle={-30}>
              <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "var(--surface-2)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="-mt-16 mb-10 text-center font-display text-3xl font-bold">{data.satisfaction.toFixed(1)}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="text-[0.7rem] text-muted-foreground">Revision rate</p>
              <p className="mt-0.5 font-display text-lg font-bold">{data.revisionRate}%</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="text-[0.7rem] text-muted-foreground">Win rate</p>
              <p className="mt-0.5 font-display text-lg font-bold">{data.winRate}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Completed Projects & Cycle Time</h2>
          <p className="mb-3 text-xs text-muted-foreground">Deliveries and average days to completion</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.completionSeries} margin={{ left: -14, right: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
              <Bar dataKey="completed" name="Completed" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="avgDays" name="Avg days" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Win Rate</h2>
          <p className="mb-3 text-xs text-muted-foreground">Proposals won versus lost</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.winRateSeries} margin={{ left: -14, right: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
              <Bar dataKey="won" name="Won" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="lost" name="Lost" stackId="a" fill="var(--surface-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Revisions vs Satisfaction</h2>
          <p className="mb-3 text-xs text-muted-foreground">Rework volume against survey score</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.satisfactionSeries} margin={{ left: -14, right: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="revisions" name="Revisions" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="score" name="Score" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">Project Types</h2>
          <p className="mb-3 text-xs text-muted-foreground">Share of engagements and revenue contribution</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeMix} dataKey="value" nameKey="type" innerRadius={52} outerRadius={86} paddingAngle={2}>
                  {typeMix.map((entry, i) => (
                    <Cell key={entry.type} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="space-y-2 self-center">
              {typeMix.map((t, i) => (
                <li key={t.type} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                  <span className="min-w-0 flex-1 truncate">{t.type}</span>
                  <span className="shrink-0 font-semibold">${(t.revenue / 1000).toFixed(0)}k</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-base font-semibold">AI Usage Statistics</h2>
          <p className="mb-3 text-xs text-muted-foreground">Prompt volume per assistant and delivery leverage</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={aiTrend} margin={{ left: -14, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Claude" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.28} />
              <Area type="monotone" dataKey="Lovable" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.28} />
              <Area type="monotone" dataKey="Base44" stackId="1" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.28} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-xs">
              <thead className="text-left uppercase tracking-wider text-muted-foreground">
                <tr>
                  {["Tool", "Prompts", "Tokens (M)", "Hours saved", "Cost"].map((h) => (
                    <th key={h} className="py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aiUsage.map((a) => (
                  <tr key={a.tool} className="border-t border-border/60">
                    <td className="py-2 font-medium">{a.tool}</td>
                    <td className="py-2 text-muted-foreground">{a.prompts.toLocaleString()}</td>
                    <td className="py-2 text-muted-foreground">{a.tokens}</td>
                    <td className="py-2 text-muted-foreground">{a.hoursSaved}h</td>
                    <td className="py-2 text-muted-foreground">${a.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
