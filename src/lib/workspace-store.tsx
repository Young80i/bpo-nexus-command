import { createContext, useContext, useMemo, type ReactNode } from "react";
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
import { usePersistentState, uid } from "@/lib/persist";

export type NewMessage = {
  conversationId: string;
  kind: Message["kind"];
  body: string;
  author: string;
  status?: Message["status"];
  attachments?: { name: string; size: string }[];
};

type Ctx = {
  milestones: Milestone[];
  moveMilestone: (id: string, stage: MilestoneStage) => void;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  addMilestone: (m: Omit<Milestone, "id">) => void;
  removeMilestone: (id: string) => void;

  conversations: Conversation[];
  messages: Message[];
  sendMessage: (msg: NewMessage) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  addConversation: (c: Omit<Conversation, "id">) => Conversation;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  markRead: (conversationId: string) => void;
  toggleStar: (conversationId: string) => void;

  prompts: Prompt[];
  addPrompt: (p: Omit<Prompt, "id">) => Prompt;
  updatePrompt: (id: string, patch: Partial<Prompt>) => void;
  removePrompt: (id: string) => void;
  duplicatePrompt: (id: string) => void;

  tracks: Record<string, StageProgress[]>;
  setStageProgress: (projectId: string, stage: DevStage, progress: number) => void;
};

const WorkspaceContext = createContext<Ctx | null>(null);

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "??"
  );
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [milestones, setMilestones] = usePersistentState<Milestone[]>("milestones", seedMilestones);
  const [conversations, setConversations] = usePersistentState<Conversation[]>("conversations", seedConversations);
  const [messages, setMessages] = usePersistentState<Message[]>("messages", seedMessages);
  const [prompts, setPrompts] = usePersistentState<Prompt[]>("prompts", seedPrompts);
  const [tracks, setTracks] = usePersistentState<Record<string, StageProgress[]>>("tracks", seedTracks);

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
      addMilestone: (m) => setMilestones((prev) => [...prev, { ...m, id: uid("ms") }]),
      removeMilestone: (id) => setMilestones((prev) => prev.filter((m) => m.id !== id)),

      conversations,
      messages,
      sendMessage: ({ conversationId, kind, body, author, status, attachments }) =>
        setMessages((prev) => [
          ...prev,
          {
            id: uid("msg"),
            conversationId,
            kind,
            author,
            initials: initials(author),
            body,
            time: "just now",
            createdAt: new Date().toISOString(),
            status: status ?? (kind === "note" ? "Draft" : "Sent"),
            unread: false,
            ...(attachments?.length ? { attachments } : {}),
          },
        ]),
      updateMessage: (id, patch) =>
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch, edited: true } : m))),
      removeMessage: (id) => setMessages((prev) => prev.filter((m) => m.id !== id)),
      addConversation: (c) => {
        const created: Conversation = { ...c, id: uid("cv") };
        setConversations((prev) => [created, ...prev]);
        return created;
      },
      updateConversation: (id, patch) =>
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      removeConversation: (id) => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setMessages((prev) => prev.filter((m) => m.conversationId !== id));
      },
      markRead: (conversationId) =>
        setMessages((prev) =>
          prev.map((m) => (m.conversationId === conversationId ? { ...m, unread: false } : m)),
        ),
      toggleStar: (conversationId) =>
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, starred: !c.starred } : c)),
        ),

      prompts,
      addPrompt: (p) => {
        const created: Prompt = { ...p, id: uid("pr") };
        setPrompts((prev) => [created, ...prev]);
        return created;
      },
      updatePrompt: (id, patch) =>
        setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      removePrompt: (id) => setPrompts((prev) => prev.filter((p) => p.id !== id)),
      duplicatePrompt: (id) =>
        setPrompts((prev) => {
          const source = prev.find((p) => p.id === id);
          if (!source) return prev;
          return [
            {
              ...source,
              id: uid("pr"),
              title: `${source.title} (copy)`,
              updated: new Date().toISOString().slice(0, 10),
            },
            ...prev,
          ];
        }),

      tracks,
      setStageProgress: (projectId, stage, progress) =>
        setTracks((prev) => ({
          ...prev,
          [projectId]: (prev[projectId] ?? []).map((s) =>
            s.stage === stage ? { ...s, progress } : s,
          ),
        })),
    }),
    [milestones, conversations, messages, prompts, tracks, setMilestones, setConversations, setMessages, setPrompts, setTracks],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
