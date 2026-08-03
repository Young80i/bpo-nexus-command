import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, Copy, RotateCcw, Sparkle, X } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/projects-store";
import { useWorkspace } from "@/lib/workspace-store";
import { clients } from "@/data/demo";
import { tasks } from "@/data/tasks";
import { vaultFiles } from "@/data/files";
import { buildSnapshot } from "@/lib/ai-context";

const STORAGE_KEY = "bpo-cto-chat";

const quickActions = [
  { label: "What should I work on today?", prompt: "Given my workspace, what is the single most important thing I should do right now? Then list the next two." },
  { label: "Analyse a Freelancer brief", prompt: "I'm going to paste a Freelancer.com project description. Analyse it fully with summary, requirements, stack, structure, difficulty, timeline, milestones, tasks, risks and deliverables:\n\n" },
  { label: "Analyse a client conversation", prompt: "Analyse this client conversation and give me a summary, action items, outstanding questions and a suggested reply:\n\n" },
  { label: "Next step for my riskiest project", prompt: "Which project is most at risk right now, why, and what is the exact next step? Tell me which tool to use." },
  { label: "Generate a Lovable prompt", prompt: "Write an optimized Lovable prompt for the next UI work on my highest priority project." },
  { label: "Pre-delivery check", prompt: "Run a pre-delivery verification on my closest-to-complete project: milestones, tasks, requirements, testing, deliverables and documentation." },
];

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function textOf(message: UIMessage) {
  return message.parts
    .map((p) => ("text" in p && typeof p.text === "string" ? p.text : ""))
    .join("");
}

export function CtoAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initial] = useState<UIMessage[]>(() => loadMessages());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { projects } = useProjects();
  const { milestones, conversations, messages: convoMessages, prompts } = useWorkspace();

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "bpo-cto",
    messages: initial,
    transport,
    onError: (e) => toast.error(e.message || "The AI CTO could not respond."),
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage unavailable */
    }
  }, [messages]);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open, status]);

  const snapshot = useMemo(
    () =>
      buildSnapshot({
        projects,
        clients,
        milestones,
        tasks,
        conversations,
        messages: convoMessages,
        files: vaultFiles,
        prompts,
      }),
    [projects, milestones, conversations, convoMessages, prompts],
  );

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    void sendMessage({ text: text.trim() }, { body: { snapshot } });
    setInput("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI CTO"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? <X className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        <span className="hidden sm:inline">{open ? "Close" : "JARVIS"}</span>
      </button>

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed bottom-0 right-0 z-40 flex h-[min(88vh,780px)] w-full flex-col border-l border-t border-border bg-surface shadow-[var(--shadow-lift)] transition-all duration-300 ease-out sm:bottom-4 sm:right-4 sm:h-[min(84vh,740px)] sm:w-[440px] sm:rounded-2xl sm:border",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl brand-gradient text-primary-foreground">
            <Bot className="h-[1.05rem] w-[1.05rem]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">JARVIS & Project Architect</p>
            <p className="truncate text-[0.7rem] text-muted-foreground">
              Sees {projects.length} projects · {milestones.length} milestones · {tasks.length} tasks
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="New conversation"
              onClick={() => {
                setMessages([]);
                toast.success("Started a new conversation");
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Close assistant" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <Conversation className="flex-1">
          <ConversationContent className="gap-4">
            {messages.length === 0 && (
              <div className="space-y-3 py-4">
                <p className="text-sm font-semibold">Your senior technical partner</p>
                <p className="text-sm text-muted-foreground">
                  I know every project, milestone, task, conversation and file in this workspace. Paste a
                  Freelancer brief or a client message, or start here:
                </p>
                <div className="grid gap-1.5">
                  {quickActions.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() =>
                        a.prompt.trim().endsWith(":") || a.prompt.endsWith("\n\n")
                          ? (setInput(a.prompt), textareaRef.current?.focus())
                          : send(a.prompt)
                      }
                      className="lift flex items-center gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-left text-xs font-medium"
                    >
                      <Sparkle className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent
                  className={cn(
                    message.role === "assistant" && "bg-transparent p-0 text-foreground",
                  )}
                >
                  <MessageResponse>{textOf(message)}</MessageResponse>
                  {message.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(textOf(message));
                        toast.success("Copied");
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  )}
                </MessageContent>
              </Message>
            ))}

            {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {error.message}
              </p>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border p-3">
          <PromptInput
            onSubmit={(_message, event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your CTO, or paste a brief / client message…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() && !busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </aside>
    </>
  );
}
