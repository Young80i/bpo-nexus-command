import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GitBranch, Play, Users, Calendar, Clock, CheckCircle } from "lucide-react";
import { Project } from "@/data/demo";
import { projectCompletion, projectHealth } from "@/lib/automation";
import { tasks } from "@/data/tasks";
import { Milestone } from "@/data/workspace"; // Fixed import
import { EngineeringStage } from "@/lib/engineering-delivery-pipeline/types";

interface ProjectPipelineCardProps {
  project: Project;
  milestones: Milestone[];
  onClick: () => void;
}

export function ProjectPipelineCard({ project, milestones, onClick }: ProjectPipelineCardProps) {
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
  
  const formatStageName = (stage: EngineeringStage) => {
    return stage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  return (
    <Card 
      className="hover:border-primary/30 transition-colors cursor-pointer h-full flex flex-col"
      onClick={onClick}
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
      <CardContent className="space-y-4 flex-1">
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
                {formatStageName(currentStage)}
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
}