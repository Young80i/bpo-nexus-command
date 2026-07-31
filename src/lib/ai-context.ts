import type { Project, Client } from "@/data/demo";
import type { Milestone, Conversation, Message, Prompt } from "@/data/workspace";
import type { Task } from "@/data/tasks";
import type { VaultFile } from "@/data/files";
import { detectSignals, projectCompletion, projectHealth, detectProjectKind } from "@/lib/automation";

export type WorkspaceSnapshot = ReturnType<typeof buildSnapshot>;

export function buildSnapshot(input: {
  projects: Project[];
  clients: Client[];
  milestones: Milestone[];
  tasks: Task[];
  conversations: Conversation[];
  messages: Message[];
  files: VaultFile[];
  prompts: Prompt[];
  focusProjectId?: string | null;
}) {
  const {
    projects,
    clients,
    milestones,
    tasks,
    conversations,
    messages,
    files,
    prompts,
    focusProjectId,
  } = input;

  const clientName = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    focusProjectId: focusProjectId ?? null,
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      freelancerUsername: c.freelancerUsername,
      rating: c.rating,
      totalRevenue: c.totalRevenue,
      status: c.status,
    })),
    projects: projects.map((p) => {
      const health = projectHealth(p, milestones, tasks);
      return {
        id: p.id,
        name: p.name,
        client: clientName[p.clientId] ?? p.clientId,
        kind: detectProjectKind(p),
        status: p.status,
        priority: p.priority,
        budget: `${p.currency} ${p.budget}`,
        startDate: p.startDate,
        dueDate: p.dueDate,
        stack: p.stack,
        aiTool: p.aiTool,
        hours: `${p.actualHours}/${p.estimatedHours}`,
        completion: projectCompletion(p.id, milestones) || p.progress,
        health: `${health.score} (${health.band})`,
        healthFactors: health.factors.map((f) => `${f.label}: ${f.detail}`),
        description: p.description,
        notes: p.notes,
      };
    }),
    milestones: milestones.map((m) => ({
      id: m.id,
      projectId: m.projectId,
      title: m.title,
      stage: m.stage,
      progress: m.progress,
      deadline: m.deadline,
      approval: m.approval,
      deliverables: m.deliverables.map((d) => `${d.done ? "[x]" : "[ ]"} ${d.label}`),
      files: m.files.map((f) => f.name),
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: t.assignee,
      progress: t.progress,
    })),
    conversations: conversations.map((c) => ({
      id: c.id,
      projectId: c.projectId,
      subject: c.subject,
      lastMessages: messages
        .filter((m) => m.conversationId === c.id)
        .slice(-4)
        .map((m) => `${m.kind}/${m.author}: ${m.body.slice(0, 220)}`),
    })),
    files: files.map((f) => ({
      name: f.name,
      kind: f.kind,
      projectId: f.projectId,
      milestoneId: f.milestoneId,
    })),
    prompts: prompts.map((p) => ({
      id: p.id,
      projectId: p.projectId,
      tool: p.tool,
      title: p.title,
      group: p.group,
      versions: p.versions?.length ?? 0,
    })),
    signals: detectSignals(projects, milestones, tasks).map((s) => ({
      kind: s.kind,
      severity: s.severity,
      title: s.title,
      detail: s.detail,
      projectId: s.projectId,
    })),
  };
}
