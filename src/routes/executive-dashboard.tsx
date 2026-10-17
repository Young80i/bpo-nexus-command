import { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/projects-store";
import { usePersistentState } from "@/lib/persist";
import { daysBetween, toDate, today } from "@/lib/automation";
import type { ProjectStatus } from "@/data/demo";

export const Route = createFileRoute("/executive-dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — High-Level Financial & Delivery Analytics | BPO Nexus" },
      {
        name: "description",
        content:
          "High-level executive metrics covering portfolio revenue, profit margins, delivery success rates, and active client retention.",
      },
      { property: "og:title", content: "Executive Dashboard — BPO Nexus" },
      { property: "og:description", content: "Executive reporting on revenue, profit margins, and portfolio performance." },
    ],
  }),
  component: ExecutiveDashboardPage,
});

const DEFAULT_METRICS = {
  monthlyRevenue: 0,
  grossMargin: 0,
  clientSatisfaction: 0,
  projectWinRate: 0,
};

type ProjectHealthPoint = {
  name: string;
  daysLeft: number;
  status: ProjectStatus | string;
};

const FALLBACK_PROJECT_HEALTH: ProjectHealthPoint[] = [
  { name: "Fleet Telemetry", daysLeft: 28, status: "In Progress" },
  { name: "Investor Portal", daysLeft: 16, status: "Review" },
  { name: "Clinical Sign-off", daysLeft: 6, status: "Waiting for Client" },
  { name: "Launch Hotfix", daysLeft: 2, status: "In Progress" },
];

function getUrgencyTheme(daysLeft: number) {
  if (daysLeft <= 3) return { color: "#ef4444", label: "Critical" };
  if (daysLeft <= 7) return { color: "#eab308", label: "Watch" };
  if (daysLeft <= 21) return { color: "#22c55e", label: "On track" };
  return { color: "#22d3ee", label: "Stable" };
}

// 1. Custom Glowing Dot for JARVIS aesthetic
const CustomUrgencyDot = (props: any) => {
  const { cx, cy, payload } = props;
  const theme = getUrgencyTheme(payload.daysLeft);
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={5} 
      fill={theme.color} 
      stroke="var(--background)" // Creates a cutout effect against the background
      strokeWidth={2} 
      style={{ filter: `drop-shadow(0px 0px 8px ${theme.color})` }} 
    />
  );
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: ProjectHealthPoint }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const theme = getUrgencyTheme(point.daysLeft);
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
      <p className="mb-1 font-semibold">{point.name}</p>
      <p className="text-muted-foreground">
        Days left: <span className="font-semibold text-foreground">{point.daysLeft}</span>
      </p>
      <p className="text-muted-foreground">
        Status: <span className="font-semibold text-foreground">{point.status}</span>
      </p>
      <p className="mt-1 font-medium" style={{ color: theme.color }}>
        {theme.label}
      </p>
    </div>
  );
}

export function ExecutiveDashboardPage() {
  const router = useRouter();
  const { projects, refresh } = useProjects();
  const [isReloading, setIsReloading] = useState(false);

  const [execMetrics, setExecMetrics] = usePersistentState(
    "bpo-exec-metrics-v1",
    DEFAULT_METRICS
  );

  const handleReloadExecutive = async () => {
    setIsReloading(true);
    toast.info("Refreshing executive metrics...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("bpo-exec-metrics-v1") 
                 || window.localStorage.getItem("bpo-nexus:bpo-exec-metrics-v1");
        if (raw) {
          setExecMetrics(JSON.parse(raw));
        } else {
          setExecMetrics(DEFAULT_METRICS);
        }
      }
      
      if (refresh) {
        await refresh();
      }
      
      await router.invalidate();
      toast.success("Executive metrics reloaded!");
    } catch {
      toast.error("Failed to refresh metrics");
    } finally {
      setIsReloading(false);
    }
  };

  const totalContractedRevenue = (projects || []).reduce((acc, p) => acc + (p.budget || 0), 0);
  const completedProjectsCount = (projects || []).filter((p) => p.status === "Completed").length;

  const projectHealthData = useMemo<ProjectHealthPoint[]>(() => {
    const live = (projects || [])
      .filter((p) => !p.archived && p.status !== "Completed")
      .map((p) => ({
        name: p.name,
        daysLeft: daysBetween(toDate(p.dueDate), today()),
        status: p.status,
      }))
      .sort((a, b) => b.daysLeft - a.daysLeft); // Sorted to make the line chart flow better visually
    return live.length ? live : FALLBACK_PROJECT_HEALTH;
  }, [projects]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Executive Command & Portfolio Analytics"
        description="High-level agency health, deadline urgency, gross margins, and revenue distribution"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleReloadExecutive}
            disabled={isReloading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isReloading ? "animate-spin" : ""}`} />
            Reload Data
          </Button>
        }
      />

      {/* Executive KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card lift p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Monthly Revenue Run-Rate</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl font-bold">
            ${(execMetrics?.monthlyRevenue || 0).toLocaleString()}
          </p>
          {(execMetrics?.monthlyRevenue || 0) > 0 ? (
            <p className="text-[0.72rem] text-emerald-500 font-medium">↑ +14.2% vs last month</p>
          ) : (
            <p className="text-[0.72rem] text-muted-foreground">No previous month data</p>
          )}
        </div>

        <div className="surface-card lift p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Portfolio Gross Margin</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-2xl font-bold">{execMetrics?.grossMargin || 0}%</p>
          <p className="text-[0.72rem] text-muted-foreground">Target threshold: 65.0%</p>
        </div>

        <div className="surface-card lift p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Client Satisfaction Score</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-bold">{execMetrics?.clientSatisfaction || 0} / 5.0</p>
          <p className="text-[0.72rem] text-muted-foreground">Based on post-delivery surveys</p>
        </div>

        <div className="surface-card lift p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Proposal Win Rate</span>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-2xl font-bold">{execMetrics?.projectWinRate || 0}%</p>
          <p className="text-[0.72rem] text-muted-foreground">Conversion on submitted proposals</p>
        </div>
      </section>

      {/* 2. The JARVIS Telemetry Style Health Chart */}
      <section className="surface-card p-5">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" /> JARVIS Engine Velocity & Urgency
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Project deadline timeline mapping urgency states to operational focus
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[0.7rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#22d3ee] drop-shadow-[0_0_4px_#22d3ee]" /> 22+ days</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#22c55e] drop-shadow-[0_0_4px_#22c55e]" /> 8–21 days</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#eab308] drop-shadow-[0_0_4px_#eab308]" /> 4–7 days</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ef4444] drop-shadow-[0_0_4px_#ef4444]" /> ≤3 days</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={projectHealthData} margin={{ left: -16, right: 24, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              fontSize={11} 
              stroke="var(--muted-foreground)" 
              dy={12} 
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              fontSize={11} 
              stroke="var(--muted-foreground)" 
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--accent)", strokeWidth: 2 }} />
            
            {/* The main glowing line */}
            <Line 
              type="monotone" 
              dataKey="daysLeft" 
              name="Days left" 
              stroke="#0ea5e9" // JARVIS base blue
              strokeWidth={3} 
              dot={<CustomUrgencyDot />} 
              activeDot={{ r: 7, fill: "#fff", stroke: "#0ea5e9", strokeWidth: 2 }}
              style={{ filter: `drop-shadow(0px 4px 10px rgba(14, 165, 233, 0.4))` }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Delivery Summary */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="surface-card p-6 rounded-xl border border-border space-y-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Total Portfolio Bookings
          </h3>
          <p className="text-xs text-muted-foreground">
            Contracted engagement volume currently tracked across all projects.
          </p>
          <p className="font-display text-3xl font-bold text-primary">
            ${(totalContractedRevenue / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="surface-card p-6 rounded-xl border border-border space-y-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Handover Completed Engagements
          </h3>
          <p className="text-xs text-muted-foreground">
            Successfully delivered and archived client projects.
          </p>
          <p className="font-display text-3xl font-bold text-foreground">
            {completedProjectsCount} <span className="text-sm font-normal text-muted-foreground">projects delivered</span>
          </p>
        </div>
      </section>
    </div>
  );
}