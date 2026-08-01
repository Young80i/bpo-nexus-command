import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  MessageSquarePlus,
  Paperclip,
  Pencil,
  Search,
  Send,
  Sparkles,
  Star,
  StickyNote,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useProjects } from "@/lib/projects-store";
import { useClients } from "@/lib/clients-store";
import { useWorkspace } from "@/lib/workspace-store";
import type { Conversation, Message } from "@/data/workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conversations")({
  head: () => ({
    meta: [
      { title: "Conversation Centre — Client & Internal Threads | BPO Nexus" },
      {
        name: "description",
        content:
          "A Slack-meets-Gmail conversation centre with client messages, internal notes, AI summaries, suggested replies, attachments and search.",
      },
      { property: "og:title", content: "Conversation Centre — BPO Nexus" },
      { property: "og:description", content: "Client messages, internal notes and AI-assisted replies in one timeline." },
    ],
  }),
  component: ConversationsPage,
});

const kindTone: Record<Message["kind"], string> = {
  client: "border-primary/30 bg-primary/5",
  team: "border-border bg-surface-1",
  note: "border-warning/35 bg-warning/8",
};

type Persona = "me" | "client" | "note";

function ConversationsPage() {
  const { projects } = useProjects();
  const { clients } = useClients();
  const {
    conversations,
    messages,
    sendMessage,
    updateMessage,
    removeMessage,
    addConversation,
    removeConversation,
    markRead,
    toggleStar,
  } = useWorkspace();
  const { confirm, element: confirmEl } = useConfirm();

  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [msgQuery, setMsgQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [persona, setPersona] = useState<Persona>("me");
  const [showSummary, setShowSummary] = useState(true);
  const [editing, setEditing] = useState<Message | null>(null);
  const [composing, setComposing] = useState(false);

  const project = (id: string) => projects.find((p) => p.id === id);
  const projectName = (id: string) => project(id)?.name ?? "Unassigned";
  const clientFor = (projectId: string) => clients.find((c) => c.id === project(projectId)?.clientId);

  const unreadFor = (cid: string) => messages.filter((m) => m.conversationId === cid && m.unread).length;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        !q ||
        c.subject.toLowerCase().includes(q) ||
        projectName(c.projectId).toLowerCase().includes(q) ||
        messages.some((m) => m.conversationId === c.id && m.body.toLowerCase().includes(q)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, messages, query, projects]);

  const active = conversations.find((c) => c.id === activeId) ?? filtered[0];
  const thread = useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === active?.id)
        .filter((m) => !msgQuery || m.body.toLowerCase().includes(msgQuery.toLowerCase())),
    [messages, active?.id, msgQuery],
  );

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast.success("Copied to clipboard");
  };

  const send = () => {
    if (!active || !draft.trim()) return;
    const clientName = clientFor(active.projectId)?.name ?? "Client";
    sendMessage({
      conversationId: active.id,
      kind: persona === "me" ? "team" : persona === "client" ? "client" : "note",
      body: draft.trim(),
      author: persona === "client" ? clientName : "You",
      status: persona === "note" ? "Draft" : "Sent",
    });
    setDraft("");
    toast.success(persona === "note" ? "Internal note added" : "Message added to the thread");
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Conversation Centre"
        description="Client messages, internal notes and AI assistance across every engagement"
        actions={
          <Button size="sm" onClick={() => setComposing(true)}>
            <MessageSquarePlus className="h-4 w-4" /> New conversation
          </Button>
        }
      />

      {!active ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
          <Button className="mt-4" onClick={() => setComposing(true)}>
            <MessageSquarePlus className="h-4 w-4" /> Start a conversation
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="surface-card flex max-h-[calc(100vh-14rem)] flex-col overflow-hidden">
            <div className="border-b border-border/70 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search conversations"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto">
              {filtered.map((c) => {
                const unread = unreadFor(c.id);
                const last = [...messages].reverse().find((m) => m.conversationId === c.id);
                return (
                  <div
                    key={c.id}
                    className={cn(
                      "group relative border-b border-border/60 transition-colors hover:bg-accent/60",
                      c.id === active.id && "bg-accent",
                    )}
                  >
                    <button
                      onClick={() => {
                        setActiveId(c.id);
                        markRead(c.id);
                      }}
                      className="w-full px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            unread ? "font-bold" : "font-medium text-foreground/85",
                          )}
                        >
                          {c.subject}
                        </span>
                        {unread > 0 && (
                          <span className="ml-auto shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[0.62rem] font-bold text-primary-foreground">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[0.7rem] text-muted-foreground">
                        {projectName(c.projectId)} · {c.channel}
                      </p>
                      <p className="mt-1 line-clamp-1 pr-6 text-xs text-muted-foreground">{last?.body}</p>
                    </button>
                    <button
                      title="Delete conversation"
                      onClick={() =>
                        confirm({
                          title: "Delete this conversation?",
                          description: `"${c.subject}" and all of its messages will be permanently removed.`,
                          onConfirm: () => {
                            removeConversation(c.id);
                            if (c.id === activeId) setActiveId("");
                            toast.success("Conversation deleted");
                          },
                        })
                      }
                      className="absolute bottom-2.5 right-2.5 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {!filtered.length && (
                <p className="p-6 text-center text-sm text-muted-foreground">No conversations found</p>
              )}
            </div>
          </aside>

          <section className="surface-card flex max-h-[calc(100vh-14rem)] min-w-0 flex-col overflow-hidden">
            <header className="flex flex-wrap items-center gap-3 border-b border-border/70 px-5 py-3.5">
              <div className="min-w-0">
                <h2 className="truncate font-display text-base font-bold">{active.subject}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {clientFor(active.projectId)?.company ?? "Unassigned client"} · {projectName(active.projectId)} ·{" "}
                  {active.channel} · {thread.length} messages
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={msgQuery}
                    onChange={(e) => setMsgQuery(e.target.value)}
                    placeholder="Search messages"
                    className="h-8 w-44 pl-8 text-xs"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => toggleStar(active.id)}>
                  <Star className={cn("h-4 w-4", active.starred && "fill-warning text-warning")} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSummary((s) => !s)}>
                  <Sparkles className="h-4 w-4" /> AI
                </Button>
              </div>
            </header>

            {showSummary && (
              <div className="grid gap-3 border-b border-border/70 bg-surface-1 p-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-background p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-semibold">AI summary</p>
                    <button
                      onClick={() => copy(active.aiSummary)}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{active.aiSummary}</p>
                </div>
                <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Wand2 className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-semibold">AI suggested reply</p>
                    <button
                      onClick={() => copy(active.aiReply)}
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">{active.aiReply}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2 h-7 text-xs"
                    onClick={() => {
                      setPersona("me");
                      setDraft(active.aiReply);
                    }}
                  >
                    Use this reply
                  </Button>
                </div>
              </div>
            )}

            <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
              {thread.map((m) => (
                <article key={m.id} className="group flex gap-3">
                  <div
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.68rem] font-bold",
                      m.kind === "note"
                        ? "bg-warning/20 text-warning"
                        : m.kind === "client"
                          ? "brand-gradient text-primary-foreground"
                          : "bg-surface-2 text-foreground",
                    )}
                  >
                    {m.kind === "note" ? <StickyNote className="h-3.5 w-3.5" /> : m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{m.author}</span>
                      <span className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">
                        {m.kind === "note" ? "Internal note" : m.kind === "client" ? "Client" : "Team"}
                      </span>
                      <span className="text-[0.68rem] text-muted-foreground">{m.time}</span>
                      {m.status && (
                        <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[0.62rem] font-semibold text-muted-foreground">
                          {m.status}
                        </span>
                      )}
                      {m.edited && <span className="text-[0.62rem] text-muted-foreground">edited</span>}
                      {m.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => copy(m.body)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditing(m)} className="text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            confirm({
                              title: "Delete this message?",
                              description: "The message will be removed from the conversation history.",
                              onConfirm: () => {
                                removeMessage(m.id);
                                toast.success("Message deleted");
                              },
                            })
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className={cn("mt-1.5 rounded-xl border px-3.5 py-2.5", kindTone[m.kind])}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                      {m.attachments?.map((a) => (
                        <div
                          key={a.name}
                          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs"
                        >
                          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                          {a.name}
                          <span className="text-muted-foreground">{a.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
              {!thread.length && (
                <p className="py-10 text-center text-sm text-muted-foreground">No messages match your search</p>
              )}
            </div>

            <footer className="border-t border-border/70 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {(
                  [
                    ["me", "As me", "border-primary/40 bg-primary/10 text-primary"],
                    ["client", "As client", "border-info/40 bg-info/10 text-info"],
                    ["note", "Internal note", "border-warning/40 bg-warning/10 text-warning"],
                  ] as const
                ).map(([value, label, tone]) => (
                  <button
                    key={value}
                    onClick={() => setPersona(value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                      persona === value ? tone : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => copy(draft)}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy draft
                </button>
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    persona === "note"
                      ? "Write an internal note…"
                      : persona === "client"
                        ? "Simulate an incoming client message…"
                        : "Reply to the client…"
                  }
                  className="flex-1 resize-none"
                />
                <Button disabled={!draft.trim()} onClick={send}>
                  <Send className="h-4 w-4" /> Send
                </Button>
              </div>
            </footer>
          </section>
        </div>
      )}

      {editing && (
        <MessageEditor
          message={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateMessage(editing.id, patch);
            setEditing(null);
            toast.success("Message updated");
          }}
        />
      )}

      {composing && (
        <ConversationComposer
          onClose={() => setComposing(false)}
          onCreate={(draftConversation) => {
            const created = addConversation(draftConversation);
            setActiveId(created.id);
            setComposing(false);
            toast.success("Conversation created");
          }}
        />
      )}

      {confirmEl}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function MessageEditor({
  message,
  onClose,
  onSave,
}: {
  message: Message;
  onClose: () => void;
  onSave: (patch: Partial<Message>) => void;
}) {
  const [body, setBody] = useState(message.body);
  const [author, setAuthor] = useState(message.author);
  const [kind, setKind] = useState<Message["kind"]>(message.kind);
  const [status, setStatus] = useState<NonNullable<Message["status"]>>(message.status ?? "Sent");

  return (
    <Modal onClose={onClose}>
      <h2 className="text-base font-bold">Edit message</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-medium text-muted-foreground">
          Sender
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          />
        </label>
        <label className="block text-xs font-medium text-muted-foreground">
          Type
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Message["kind"])}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
          >
            <option value="client">Client</option>
            <option value="team">Team</option>
            <option value="note">Internal note</option>
          </select>
        </label>
        <label className="block text-xs font-medium text-muted-foreground">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as NonNullable<Message["status"]>)}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Delivered">Delivered</option>
            <option value="Read">Read</option>
          </select>
        </label>
      </div>
      <textarea
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mt-3 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (!body.trim()) {
              toast.error("Message body cannot be empty");
              return;
            }
            onSave({ body: body.trim(), author, kind, status });
          }}
        >
          Save changes
        </Button>
      </div>
    </Modal>
  );
}

function ConversationComposer({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: Omit<Conversation, "id">) => void;
}) {
  const { projects } = useProjects();
  const [subject, setSubject] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [channel, setChannel] = useState<Conversation["channel"]>("Freelancer Chat");

  return (
    <Modal onClose={onClose}>
      <h2 className="text-base font-bold">New conversation</h2>
      <div className="mt-4 space-y-3">
        <label className="block text-xs font-medium text-muted-foreground">
          Subject
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Sprint 4 review & sign-off"
            className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-muted-foreground">
            Project
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Channel
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as Conversation["channel"])}
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              <option value="Freelancer Chat">Freelancer Chat</option>
              <option value="Email">Email</option>
              <option value="Internal">Internal</option>
            </select>
          </label>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (!subject.trim()) {
              toast.error("Subject is required");
              return;
            }
            if (!projectId) {
              toast.error("Select a project first");
              return;
            }
            onCreate({
              subject: subject.trim(),
              projectId,
              channel,
              starred: false,
              aiSummary: "No AI summary yet — add messages and run the AI assistant.",
              aiReply: "",
            });
          }}
        >
          Create conversation
        </Button>
      </div>
    </Modal>
  );
}
