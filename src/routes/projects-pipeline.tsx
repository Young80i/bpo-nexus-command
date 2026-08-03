import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, Users, Clock, CheckCircle, AlertCircle, GitBranch, Play, Workflow } from "lucide-react";
import { useProjects } from "@/lib/projects-store";
import { useWorkspace } from "@/lib/workspace-store";
import { projectCompletion, projectHealth } from "@/lib/automation";
import { tasks } from "@/data/tasks";
import { PipelineItem } from "@/lib/engineering-pipeline/types";
import { EngineeringStage } from "@/lib/engineering-delivery-pipeline/types";

function ProjectsPipeline() {
  const { projects } = useProjects();
  const { milestones } = useWorkspace();
  const navigate = useNavigate();

  // Get active projects (not completed and not archived)
  const activeProjects = projects.filter(
    (p) => p.status !== "Completed" && !p.archived
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Engineering Pipeline</h1>
          <p className="text-muted-foreground">
            {activeProjects.length} active projects in the delivery pipeline
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Pipeline Overview */}
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Pipeline Overview
          </CardTitle>
          <CardDescription>
            Track projects through the complete engineering delivery lifecycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
            {[
              'client-request',
              'requirements-analysis',
              'lovable-prompt-generation',
              'lovable-application-development',
              'repository-import',
              'repository-scan',
              'continue-prompt-generation',
              'continue-implementation',
              'engineering-review',
              'node-validation',
              'github-commit-push',
              'deployment',
              'client-delivery',
              'engineering-memory'
            ].map((stage, index) => (
              <div key={stage} className="text-center">
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="text-xs font-medium">
                  {stage.split('-')[0].charAt(0).toUpperCase() + stage.split('-')[0].slice(1)}
                </div>
                <div className="text-[0.6rem] text-muted-foreground">
                  {stage.split('-').slice(1).join(' ').substring(0, 10)}
                  {stage.split('-').slice(1).join(' ').length > 10 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeProjects.map((project) => {
          const completion = projectCompletion(project.id, milestones);
          const health = projectHealth(project, milestones, tasks);
          
          // Simulate pipeline stage for demonstration
          const pipelineStages: EngineeringStage[] = [
            'client-request',
            'requirements-analysis',
            'lovable-prompt-generation',
            'lovable-application-development',
            'repository-import',
            'repository-scan',
            'continue-prompt-generation',
            'continue-implementation',
            'engineering-review',
            'node-validation',
            'github-commit-push',
            'deployment',
            'client-delivery',
            'engineering-memory'
          ];
          
          // Randomly select a current stage for demo purposes
          const currentStageIndex = Math.floor(Math.random() * pipelineStages.length);
          const currentStage = pipelineStages[currentStageIndex];
          
          return (
            <Card 
              key={project.id} 
              className="hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate({ to: `/clients/$clientId`, params: { clientId: project.clientId } })}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <Badge 
                    variant={
                      health.band === "Excellent" ? "default" :
                      health.band === "Healthy" ? "secondary" :
                      health.band === "At Risk" ? "destructive" : "outline"
                    }
                  >
                    {health.band}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{completion}%</span>
                  </div>
                  <Progress value={completion} />
                </div>
                
                {/* Project Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    1 member {/* Fixed: removed reference to non-existent team property */}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No deadline'}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {project.estimatedHours || 0} hrs
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    {tasks.filter(t => t.projectId === project.id && t.status === "Done").length} tasks
                  </div>
                </div>
                
                {/* Pipeline Stage */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current Stage:</span>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3 text-primary" />
                      <span className="font-medium">
                        {currentStage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${(currentStageIndex / (pipelineStages.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 text-xs gap-1">
                    <Play className="h-3 w-3" />
                    Start Work
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/projects-pipeline")({
  component: ProjectsPipeline,
});