import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Paperclip,
  Search,
  Send,
  Sparkles,
  Star,
  StickyNote,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/projects-store";
import { useWorkspace } from "@/lib/workspace-store";
import type { Message } from "@/data/workspace";
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

function ConversationsPage() {
  const { projects } = useProjects();
  const { conversations, messages, sendMessage, markRead, toggleStar } = useWorkspace();
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [msgQuery, setMsgQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [asNote, setAsNote] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Unassigned";

  const unreadFor = (cid: string) =>
    messages.filter((m) => m.conversationId === cid && m.unread).length;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        !q ||
        c.subject.toLowerCase().includes(q) ||
        projectName(c.projectId).toLowerCase().includes(q) ||
        messages.some((m) => m.conversationId === c.id && m.body.toLowerCase().includes(q)),
    );
  }, [conversations, messages, query, projects]);

  const active = conversations.find((c) => c.id === activeId) ?? filtered[0];
  const thread = useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === active?.id)
        .filter((m) => !msgQuery || m.body.toLowerCase().includes(msgQuery.toLowerCase())),
    [messages, active?.id, msgQuery],
  );

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  if (!active) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Conversation Centre"
        description="Client messages, internal notes and AI assistance across every engagement"
      />

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
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    markRead(c.id);
                  }}
                  className={cn(
                    "w-full border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent/60",
                    c.id === active.id && "bg-accent",
                  )}
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
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{last?.body}</p>
                </button>
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
                {projectName(active.projectId)} · {active.channel} · {thread.length} messages
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
                <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                  {active.aiReply}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 h-7 text-xs"
                  onClick={() => setDraft(active.aiReply)}
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{m.author}</span>
                    <span className="text-[0.68rem] uppercase tracking-wide text-muted-foreground">
                      {m.kind === "note" ? "Internal note" : m.kind === "client" ? "Client" : "Team"}
                    </span>
                    <span className="text-[0.68rem] text-muted-foreground">{m.time}</span>
                    {m.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    <button
                      onClick={() => copy(m.body)}
                      className="ml-auto text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
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
            <div className="mb-2 flex items-center gap-2">
              <button
                onClick={() => setAsNote(false)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  !asNote ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground",
                )}
              >
                Client message
              </button>
              <button
                onClick={() => setAsNote(true)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  asNote ? "border-warning/40 bg-warning/10 text-warning" : "border-border text-muted-foreground",
                )}
              >
                Internal note
              </button>
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
                placeholder={asNote ? "Write an internal note…" : "Reply to the client…"}
                className="flex-1 resize-none"
              />
              <Button
                disabled={!draft.trim()}
                onClick={() => {
                  sendMessage(active.id, asNote ? "note" : "client", draft.trim());
                  setDraft("");
                }}
              >
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
