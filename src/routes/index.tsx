import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Activity,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderKanban,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useClients } from "@/lib/clients-store";
import { useProjects } from "@/lib/projects-store";
import { useWorkspace } from "@/lib/workspace-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Delivery Operations & Financial Command | BPO Nexus" },
      {
        name: "description",
        content:
          "Real-time operational command center for active client projects, delivery milestones, team capacity, and automated agency workflows.",
      },
      { property: "og:title", content: "Dashboard — BPO Nexus" },
      { property: "og:description", content: "Real-time agency delivery operations, client pipeline, and task tracking." },
    ],
  }),
  component: DashboardPage,
});

export function DashboardPage() {
  const router = useRouter();
  const { projects } = useProjects();
  const { clients } = useClients();
  const { milestones } = useWorkspace();
  const [isReloading, setIsReloading] = useState(false);

  const activeProjects = (projects || []).filter((p) => p.status === "In Progress" || p.status === "Planning");
  const pendingMilestones = (milestones || []).filter((m) => m.stage === "In Progress" || m.stage === "Waiting Approval");
  const activeClients = (clients || []).filter((c) => c.status === "Active");
  const totalBookedValue = (projects || []).reduce((acc, p) => acc + (p.budget || 0), 0);

  const handleReloadDashboard = async () => {
    setIsReloading(true);
    toast.info("Re-synchronizing operational data...");
    
    try {
      // Invalidate TanStack router cache to force route re-evaluation
      await router.invalidate();
      
      // If window exists, trigger a brief state re-hydration check
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
      toast.success("Operational dashboard updated!");
    } catch {
      toast.error("Failed to reload data");
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Delivery Operations Command"
        description="Live view of client engagement, milestone velocity, and active project health"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleReloadDashboard}
            disabled={isReloading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isReloading ? "animate-spin" : ""}`} />
            Reload Data
          </Button>
        }
      />

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-card lift p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Engagements</span>
            <FolderKanban className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-2xl font-bold">{activeProjects.length}</p>
          <p className="text-[0.72rem] text-muted-foreground">{projects?.length || 0} total projects on record</p>
        </div>

        <div className="surface-card lift p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pending Milestones</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-bold">{pendingMilestones.length}</p>
          <p className="text-[0.72rem] text-muted-foreground">Across all active client accounts</p>
        </div>

        <div className="surface-card lift p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Clients</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-display text-2xl font-bold">{activeClients.length}</p>
          <p className="text-[0.72rem] text-muted-foreground">Verified accounts in system</p>
        </div>

        <div className="surface-card lift p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pipeline Value</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-2xl font-bold">${(totalBookedValue / 1000).toFixed(0)}k</p>
          <p className="text-[0.72rem] text-muted-foreground">Total contracted engagement value</p>
        </div>
      </section>

      {/* Active Projects Overview */}
      <section className="surface-card p-6 rounded-xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Active Client Projects
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live engagement statuses and delivery progress
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 text-right font-semibold">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(activeProjects.slice(0, 5) || []).map((project) => (
                <tr key={project.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{project.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project.clientName || "Internal"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[0.68rem] font-semibold">
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="font-mono text-[0.7rem]">{project.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    ${(project.budget || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}