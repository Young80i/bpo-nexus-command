import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Check, Copy, Zap, GitBranch, Rocket, Workflow } from "lucide-react";
import { MetricCard } from "@/components/ai/MetricCard";
import { useExecutiveMetrics } from "@/lib/executive-metrics";
import { ProtectedRoute } from "@/lib/auth/protected-route";

function ExecutiveDashboard() {
  const metrics = useExecutiveMetrics();
  
  // Helper to get a display value from various metric types
  const getMetricValue = (metric: any) => {
    if (metric.progress !== undefined) return `${metric.progress}%`;
    if (metric.score !== undefined) return metric.score;
    if (metric.count !== undefined) return metric.count;
    if (metric.amount !== undefined) return metric.amount;
    if (metric.commitsPerWeek !== undefined) return `${metric.commitsPerWeek}/wk`;
    if (metric.activePipelines !== undefined) return metric.activePipelines;
    if (metric.commitsThisWeek !== undefined) return `${metric.commitsThisWeek} commits`;
    if (metric.successfulDeployments !== undefined) return `${metric.successfulDeployments} success`;
    return "N/A";
  };

  // Helper to get tone class based on metric type
  const getMetricTone = (metric: any) => {
    if (metric.severity === "High" || metric.status === "Critical") return "bg-destructive/12";
    if (metric.severity === "Medium") return "bg-warning/15";
    if (metric.band === "Excellent" || metric.status === "Ready") return "bg-success/12";
    return "brand-gradient";
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <PageHeader
        title="Executive Dashboard"
        description="Executive Intelligence Operating System"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export report</Button>
            <Button size="sm" className="gap-1.5">
              <Zap className="h-4 w-4" /> JARVIS Weekly Digest
            </Button>
          </div>
        }
      />

      {/* Executive KPI Grid */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          title={metrics.currentSprint.title}
          value={getMetricValue(metrics.currentSprint)}
          description={metrics.currentSprint.description}
          status={metrics.currentSprint.status}
        />
        <MetricCard
          title={metrics.productionReadiness.title}
          value={getMetricValue(metrics.productionReadiness)}
          description={metrics.productionReadiness.description}
          status={metrics.productionReadiness.status}
        />
        <MetricCard
          title={metrics.architectureScore.title}
          value={getMetricValue(metrics.architectureScore)}
          description={metrics.architectureScore.description}
        />
        <MetricCard
          title={metrics.technicalDebt.title}
          value={getMetricValue(metrics.technicalDebt)}
          description={metrics.technicalDebt.description}
          status={metrics.technicalDebt.severity}
        />
        <MetricCard
          title={metrics.securityScore.title}
          value={getMetricValue(metrics.securityScore)}
          description={metrics.securityScore.description}
        />
        <MetricCard
          title={metrics.engineeringVelocity.title}
          value={getMetricValue(metrics.engineeringVelocity)}
          description={metrics.engineeringVelocity.description}
        />
        <MetricCard
          title={metrics.activeProjects.title}
          value={getMetricValue(metrics.activeProjects)}
          description={metrics.activeProjects.description}
        />
        <MetricCard
          title={metrics.openIssues.title}
          value={getMetricValue(metrics.openIssues)}
          description={metrics.openIssues.description}
          status={metrics.openIssues.severity}
        />
        <MetricCard
          title={metrics.criticalRisks.title}
          value={getMetricValue(metrics.criticalRisks)}
          description={metrics.criticalRisks.description}
          status={metrics.criticalRisks.severity}
        />
        <MetricCard
          title={metrics.recommendedNextFeature.title}
          value="Feature"
          description={metrics.recommendedNextFeature.description}
        />
        <MetricCard
          title={metrics.recentReviews.title}
          value={getMetricValue(metrics.recentReviews)}
          description={metrics.recentReviews.description}
        />
        <MetricCard
          title={metrics.executiveRecommendations.title}
          value={metrics.executiveRecommendations.recommendations.length}
          description={`${metrics.executiveRecommendations.recommendations.length} recommendations`}
        />
      </section>

      {/* Engineering Pipeline Section */}
      <section className="surface-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">{metrics.engineeringPipeline.title}</h2>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {metrics.engineeringPipeline.description}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
          {Object.entries(metrics.engineeringPipeline.stages).map(([stage, count]) => (
            <div key={stage} className="rounded-md bg-muted p-2 text-center text-xs">
              <div className="font-semibold">{count}</div>
              <div className="truncate text-muted-foreground">
                {stage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Insights Grid */}
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {/* Production Readiness Tile */}
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Production Readiness</h2>
            <span className="rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
              {metrics.productionReadiness.status}
            </span>
          </div>
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {metrics.productionReadiness.description}
          </p>
        </div>

        {/* Architecture Score Tile */}
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Architecture Score</h2>
            <span className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
              {metrics.architectureScore.band}
            </span>
          </div>
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {metrics.architectureScore.description}
          </p>
        </div>

        {/* Technical Debt Tile */}
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Technical Debt</h2>
            <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
              {metrics.technicalDebt.severity}
            </span>
          </div>
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {metrics.technicalDebt.description}
          </p>
        </div>

        {/* Security Score Tile */}
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Security Score</h2>
            <span className="rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
              {metrics.securityScore.band}
            </span>
          </div>
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {metrics.securityScore.description}
          </p>
        </div>
      </section>

      {/* GitHub and Deployment Status */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* GitHub Status */}
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">{metrics.githubStatus.title}</h2>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            {metrics.githubStatus.description}
          </p>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="font-semibold">{metrics.githubStatus.commitsThisWeek}</span>
              <div className="text-muted-foreground">Commits</div>
            </div>
            <div>
              <span className="font-semibold">{metrics.githubStatus.openPRs}</span>
              <div className="text-muted-foreground">Open PRs</div>
            </div>
          </div>
        </div>

        {/* Deployment Status */}
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">{metrics.deploymentStatus.title}</h2>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            {metrics.deploymentStatus.description}
          </p>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="font-semibold text-success">{metrics.deploymentStatus.successfulDeployments}</span>
              <div className="text-muted-foreground">Successful</div>
            </div>
            <div>
              <span className="font-semibold text-destructive">{metrics.deploymentStatus.failedDeployments}</span>
              <div className="text-muted-foreground">Failed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="surface-card p-5">
        <h2 className="mb-4 text-base font-semibold">Recent Reviews</h2>
        <ul className="space-y-2">
          {metrics.recentReviews.count > 0
            ? Array.from({ length: metrics.recentReviews.count }).map((_, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                Recent Review {i + 1} (Avg: {metrics.recentReviews.averageRating.toFixed(1)}/5)
              </li>
            )) : (
              <li className="text-sm text-muted-foreground">No recent reviews</li>
            )}
        </ul>
        <Button variant="outline" size="sm" className="mt-2 gap-1.5">
          <Copy className="h-3.5 w-3.5" /> Copy summary
        </Button>
      </section>

      {/* Executive Recommendations */}
      <section className="surface-card p-5">
        <h2 className="mb-4 text-base font-semibold">Executive Recommendations</h2>
        <ul className="space-y-2">
          {metrics.executiveRecommendations.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2 text-xs">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
              {rec}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// Export the route definition for the TanStack Router
export const Route = createFileRoute("/executive-dashboard")({
  component: ExecutiveDashboard,
});