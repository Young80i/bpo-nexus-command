import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  conversations as seedConversations,
  devTracks as seedTracks,
  messages as seedMessages,
  milestones as seedMilestones,
  prompts as seedPrompts,
  type Conversation,
  type DevStage,
  type Message,
  type Milestone,
  type MilestoneStage,
  type Prompt,
  type StageProgress,
} from "@/data/workspace";

type Ctx = {
  milestones: Milestone[];
  moveMilestone: (id: string, stage: MilestoneStage) => void;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  addMilestone: (m: Omit<Milestone, "id">) => void;
  removeMilestone: (id: string) => void;

  conversations: Conversation[];
  messages: Message[];
  sendMessage: (conversationId: string, kind: Message["kind"], body: string) => void;
  markRead: (conversationId: string) => void;
  toggleStar: (conversationId: string) => void;

  prompts: Prompt[];
  addPrompt: (p: Omit<Prompt, "id">) => void;
  updatePrompt: (id: string, patch: Partial<Prompt>) => void;
  removePrompt: (id: string) => void;

  tracks: Record<string, StageProgress[]>;
  setStageProgress: (projectId: string, stage: DevStage, progress: number) => void;
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [milestones, setMilestones] = useState<Milestone[]>(seedMilestones);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [prompts, setPrompts] = useState<Prompt[]>(seedPrompts);
  const [tracks, setTracks] = useState<Record<string, StageProgress[]>>(seedTracks);

  const value = useMemo<Ctx>(
    () => ({
      milestones,
      moveMilestone: (id, stage) =>
        setMilestones((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  stage,
                  progress: stage === "Completed" ? 100 : stage === "Cancelled" ? 0 : m.progress,
                  completionDate:
                    stage === "Completed"
                      ? (m.completionDate ?? new Date().toISOString().slice(0, 10))
                      : null,
                  approval:
                    stage === "Completed"
                      ? "Approved"
                      : stage === "Waiting Approval"
                        ? "Pending"
                        : stage === "Cancelled"
                          ? "Rejected"
                          : m.approval,
                }
              : m,
          ),
        ),
      updateMilestone: (id, patch) =>
        setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      addMilestone: (m) =>
        setMilestones((prev) => [...prev, { ...m, id: `ms${Date.now()}` }]),
      removeMilestone: (id) => setMilestones((prev) => prev.filter((m) => m.id !== id)),

      conversations,
      messages,
      sendMessage: (conversationId, kind, body) =>
        setMessages((prev) => [
          ...prev,
          {
            id: `msg${Date.now()}`,
            conversationId,
            kind,
            author: "You",
            initials: "YO",
            body,
            time: "just now",
            unread: false,
          },
        ]),
      markRead: (conversationId) =>
        setMessages((prev) =>
          prev.map((m) => (m.conversationId === conversationId ? { ...m, unread: false } : m)),
        ),
      toggleStar: (conversationId) =>
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, starred: !c.starred } : c)),
        ),

      prompts,
      addPrompt: (p) => setPrompts((prev) => [{ ...p, id: `pr${Date.now()}` }, ...prev]),
      updatePrompt: (id, patch) =>
        setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      removePrompt: (id) => setPrompts((prev) => prev.filter((p) => p.id !== id)),

      tracks,
      setStageProgress: (projectId, stage, progress) =>
        setTracks((prev) => ({
          ...prev,
          [projectId]: (prev[projectId] ?? []).map((s) =>
            s.stage === stage ? { ...s, progress } : s,
          ),
        })),
    }),
    [milestones, conversations, messages, prompts, tracks],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
