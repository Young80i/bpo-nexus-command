import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  FileText, 
  ThumbsUp, 
  ThumbsDown,
  Play,
  GitBranch
} from "lucide-react";
import { Project, Client } from "@/data/demo";
import { PipelineItem } from "@/lib/engineering-pipeline/types";
import { EngineeringStage } from "@/lib/engineering-delivery-pipeline/types";

interface ApprovalItem {
  id: string;
  projectId: string;
  projectName: string;
  stage: EngineeringStage;
  description: string;
  requestedBy: string;
  requestedAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
}

interface CEOApprovalWorkflowProps {
  projects: Project[];
  clients: Client[];
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, reason: string) => void;
}

export function CEOApprovalWorkflow({ projects, clients, onApprove, onReject }: CEOApprovalWorkflowProps) {
  // Create a map of clientId to client for quick lookup
  const clientMap = clients.reduce((acc, client) => {
    acc[client.id] = client;
    return acc;
  }, {} as Record<string, Client>);

  // Simulate approval items based on projects and pipeline stages
  const approvalItems: ApprovalItem[] = projects.slice(0, 5).map((project, index) => {
    const stages: EngineeringStage[] = [
      'requirements-analysis',
      'lovable-prompt-generation',
      'continue-prompt-generation',
      'engineering-review',
      'deployment'
    ];
    
    const stage = stages[index % stages.length];
    
    // Get the client for this project
    const client = clientMap[project.clientId];
    const requestedBy = client ? client.name : 'Engineering Team';
    
    return {
      id: `approval-${project.id}-${stage}`,
      projectId: project.id,
      projectName: project.name,
      stage,
      description: `Approval required for ${stage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
      requestedBy: requestedBy,
      requestedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low',
      status: index % 4 === 0 ? 'approved' : index % 4 === 1 ? 'rejected' : index % 4 === 2 ? 'in-progress' : 'pending'
    };
  });

  const formatStageName = (stage: EngineeringStage) => {
    return stage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusIcon = (status: ApprovalItem['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ApprovalItem['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          CEO Approval Workflow
        </CardTitle>
        <CardDescription>
          Review and approve engineering decisions requiring executive authorization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvalItems.map((item) => (
            <div 
              key={item.id} 
              className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{item.projectName}</h3>
                    {getStatusIcon(item.status)}
                    {getStatusBadge(item.status)}
                    <Badge 
                      variant={
                        item.priority === 'critical' ? 'destructive' :
                        item.priority === 'high' ? 'default' :
                        item.priority === 'medium' ? 'secondary' : 'outline'
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.requestedBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.requestedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {formatStageName(item.stage)}
                    </div>
                  </div>
                </div>
                {item.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-3 text-xs"
                      onClick={() => onReject(item.id, "Not approved")}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 px-3 text-xs"
                      onClick={() => onApprove(item.id)}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {approvalItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
            <p>No pending approvals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}