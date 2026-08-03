import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlarmClock,
  Bot,
  Check,
  ClipboardCheck,
  Copy,
  Gauge,
  ListChecks,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/badges";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/projects-store";
import { useWorkspace } from "@/lib/workspace-store";
import { useAutomation } from "@/lib/automation-store";
import { clients } from "@/data/demo";
import { tasks } from "@/data/tasks";
import {
  automationCatalog,
  dailyPlan,
  deliveryPack,
  detectProjectKind,
  detectSignals,
  generateMilestones,
  generateStages,
  generateTasks,
  portfolioDraft,
  projectCompletion,
  projectHealth,
} from "@/lib/automation";
import { analyseBrief, analyseConversation, type BriefAnalysis, type ConversationAnalysis } from "@/lib/ai.functions";

export const Route = createFileRoute("/automation")({
    head: () => ({
    meta: [
      { title: "JARVIS Automation Engine — BPO Nexus" },
      {
        name: "description",
        content:
          "Automate project setup, milestone planning, health scoring, reminders and delivery packs across every project.",
      },
      { property: "og:title", content: "JARVIS Automation Engine — BPO Nexus" },
      {
        property: "og:description",
        content: "Automated project stages, milestones, tasks, health scores, reminders and delivery packs.",
      },
    ],
  }),
  component: AutomationPage,
});

function copy(text: string) {
  void navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

function Card({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: typeof Bot;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="surface-card p-4 md:p-5">
      <header className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/12 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </header>
      {children}
    </section>
  );
}

function AutomationPage() {
  const { projects } = useProjects();
  const { milestones } = useWorkspace();
  const { enabled, isOn, toggle, setAll } = useAutomation();

  const [focusId, setFocusId] = useState(() => projects[0]?.id ?? "");
  const [brief, setBrief] = useState("");
  const [briefResult, setBriefResult] = useState<BriefAnalysis | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [convo, setConvo] = useState("");
  const [convoResult, setConvoResult] = useState<ConversationAnalysis | null>(null);
  const [convoLoading, setConvoLoading] = useState(false);

  const focus = projects.find((p) => p.id === focusId) ?? projects[0];
  const client = clients.find((c) => c.id === focus?.clientId);

  const plan = useMemo(() => dailyPlan(projects, milestones, tasks), [projects, milestones]);
  const signals = useMemo(() => detectSignals(projects, milestones, tasks), [projects, milestones]);
  const health = focus ? projectHealth(focus, milestones, tasks) : null;
  const pack = focus ? deliveryPack(focus, milestones, client) : null;
  const portfolio = focus ? portfolioDraft(focus, client) : null;
  const kind = focus ? detectProjectKind(focus) : "Web App";
  const generatedMilestones = focus ? generateMilestones(focus, kind) : [];

  const runBrief = async () => {
    if (brief.trim().length < 20) return toast.error("Paste a longer project description first.");
    setBriefLoading(true);
    try {
      setBriefResult(await analyseBrief({ data: { text: brief } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBriefLoading(false);
    }
  };

  const runConvo = async () => {
    if (convo.trim().length < 20) return toast.error("Paste a longer conversation first.");
    setConvoLoading(true);
    try {
      setConvoResult(await analyseConversation({ data: { text: convo } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setConvoLoading(false);
    }
  };

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="animate-fade-in space-y-5">
            <PageHeader
        title="JARVIS Automation Engine"
        description={`${activeCount} of ${automationCatalog.length} automations running across every project`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAll(false)}>
              Disable all
            </Button>
            <Button size="sm" onClick={() => setAll(true)}>
              Enable all
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-muted-foreground" htmlFor="focus-project">
          Focus project
        </label>
        <select
          id="focus-project"
          className="field h-9 w-auto min-w-[16rem]"
          value={focus?.id ?? ""}
          onChange={(e) => setFocusId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[0.7rem] font-semibold">
          Detected type: {kind}
        </span>
      </div>

      {/* Daily planner + health */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {isOn("dailyPlanner") && (
          <Card title="Daily AI work planner" icon={Sparkles}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Today's priorities
                </p>
                <ol className="mt-2 space-y-2">
                  {plan.priorities.map((p, i) => (
                    <li key={i} className="rounded-lg border border-border bg-surface-2/50 p-2.5">
                      <p className="text-sm font-medium leading-snug">{p.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.why}</p>
                    </li>
                  ))}
                  {plan.priorities.length === 0 && (
                    <li className="text-sm text-muted-foreground">Nothing urgent — build ahead of schedule.</li>
                  )}
                </ol>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tasks due today
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {plan.dueToday.slice(0, 4).map((t) => (
                      <li key={t.id} className="flex items-center gap-2 text-sm">
                        <ListChecks className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{t.title}</span>
                      </li>
                    ))}
                    {plan.dueToday.length === 0 && (
                      <li className="text-sm text-muted-foreground">No tasks due today.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Upcoming milestones
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {plan.upcomingMilestones.slice(0, 4).map((m) => (
                      <li key={m.id} className="flex items-center gap-2 text-sm">
                        <AlarmClock className="h-3.5 w-3.5 shrink-0 text-warning" />
                        <span className="truncate">{m.title}</span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{m.deadline}</span>
                      </li>
                    ))}
                    {plan.upcomingMilestones.length === 0 && (
                      <li className="text-sm text-muted-foreground">Nothing due in the next 14 days.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}

        {isOn("healthScore") && focus && health && (
          <Card title="Project health score" icon={Gauge}>
            <div className="flex items-center gap-4">
              <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-border">
                <span className="text-xl font-bold">{health.score}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{focus.name}</p>
                <p
                  className={cn(
                    "mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold",
                    health.band === "Excellent" && "border-success/25 bg-success/12 text-success",
                    health.band === "Healthy" && "border-primary/25 bg-primary/12 text-primary",
                    health.band === "At Risk" && "border-warning/30 bg-warning/15 text-warning",
                    health.band === "Critical" && "border-destructive/25 bg-destructive/12 text-destructive",
                  )}
                >
                  {health.band}
                </p>
                {isOn("completion") && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Auto completion: {projectCompletion(focus.id, milestones)}%
                    </p>
                    <ProgressBar className="mt-1" value={projectCompletion(focus.id, milestones)} />
                  </div>
                )}
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {health.factors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      f.impact < 0 ? "bg-destructive" : "bg-success",
                    )}
                  />
                  <span>
                    <span className="font-medium">{f.label}</span>
                    <span className="text-muted-foreground"> — {f.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Signals */}
      {isOn("notifications") && (
        <Card title="Smart notifications & reminders" icon={AlarmClock}>
          <ul className="grid gap-2 md:grid-cols-2">
            {signals.slice(0, 8).map((s) => (
              <li
                key={s.id}
                className={cn(
                  "rounded-lg border p-3",
                  s.severity === "high"
                    ? "border-destructive/25 bg-destructive/8"
                    : s.severity === "medium"
                      ? "border-warning/30 bg-warning/10"
                      : "border-border bg-surface-2/50",
                )}
              >
                <p className="text-sm font-medium leading-snug">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
                <span className="mt-1.5 inline-block rounded-full border border-border bg-surface px-2 py-0.5 text-[0.65rem] font-semibold">
                  {s.kind}
                </span>
              </li>
            ))}
            {signals.length === 0 && (
              <li className="text-sm text-muted-foreground">All clear — no risks detected.</li>
            )}
          </ul>
        </Card>
      )}

      {/* AI analysers */}
      <div className="grid gap-4 lg:grid-cols-2">
        {isOn("briefAnalysis") && (
          <Card title="Analyse a Freelancer brief" icon={Wand2}>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              placeholder="Paste the Freelancer.com project description here…"
              className="w-full rounded-lg border border-border bg-surface-2 p-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
            <Button className="mt-2 gap-2" size="sm" onClick={runBrief} disabled={briefLoading}>
              {briefLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Analyse brief
            </Button>
            {briefResult && (
              <div className="mt-4 space-y-3 text-sm">
                <p className="text-muted-foreground">{briefResult.summary}</p>
                <div className="flex flex-wrap gap-2 text-[0.7rem] font-semibold">
                  <span className="rounded-full border border-primary/25 bg-primary/12 px-2.5 py-0.5 text-primary">
                    {briefResult.difficulty}
                  </span>
                  <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5">
                    {briefResult.estimatedCompletion}
                  </span>
                  {briefResult.techStack.map((t) => (
                    <span key={t} className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
                {(
                  [
                    ["Milestones", briefResult.milestones.map((m) => `${m.title} (${m.days}d) — ${m.outcome}`)],
                    ["Tasks", briefResult.tasks.map((t) => `${t.title} · ${t.milestone} · ${t.tool}`)],
                    ["Deliverables", briefResult.deliverables],
                    ["Risks", briefResult.risks],
                  ] as const
                ).map(([label, items]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <ul className="mt-1 space-y-1">
                      {items.map((i, idx) => (
                        <li key={idx} className="flex gap-2 text-xs">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copy(JSON.stringify(briefResult, null, 2))}>
                  <Copy className="h-3.5 w-3.5" /> Copy analysis
                </Button>
              </div>
            )}
          </Card>
        )}

        {isOn("conversationAnalysis") && (
          <Card title="Analyse a client conversation" icon={Bot}>
            <textarea
              value={convo}
              onChange={(e) => setConvo(e.target.value)}
              rows={5}
              placeholder="Paste the client conversation here…"
              className="w-full rounded-lg border border-border bg-surface-2 p-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
            <Button className="mt-2 gap-2" size="sm" onClick={runConvo} disabled={convoLoading}>
              {convoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Analyse conversation
            </Button>
            {convoResult && (
              <div className="mt-4 space-y-3 text-sm">
                <p className="text-muted-foreground">{convoResult.summary}</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action items</p>
                  <ul className="mt-1 space-y-1">
                    {convoResult.actionItems.map((a, i) => (
                      <li key={i} className="flex gap-2 text-xs">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Outstanding questions
                  </p>
                  <ul className="mt-1 space-y-1">
                    {convoResult.outstandingQuestions.map((q, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {q}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-border bg-surface-2/60 p-3">
                  <p className="text-xs font-semibold">Suggested reply</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{convoResult.suggestedReply}</p>
                  <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => copy(convoResult.suggestedReply)}>
                    <Copy className="h-3.5 w-3.5" /> Copy reply
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Generated plan + delivery pack */}
      <div className="grid gap-4 lg:grid-cols-2">
        {(isOn("stages") || isOn("milestones") || isOn("tasks")) && focus && (
          <Card title={`Auto-generated plan · ${kind}`} icon={ListChecks}>
            {isOn("stages") && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {generateStages(kind).map((s) => (
                  <span key={s} className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[0.7rem] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {isOn("milestones") && (
              <ul className="space-y-2">
                {generatedMilestones.map((m) => (
                  <li key={m.id} className="rounded-lg border border-border bg-surface-2/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{m.deadline}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                    {isOn("tasks") && (
                      <ul className="mt-2 space-y-1">
                        {generateTasks(m).map((t, i) => (
                          <li key={i} className="flex items-center gap-2 text-[0.72rem] text-muted-foreground">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            {t.title} · due {t.dueDate} · {t.priority}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {isOn("deliveryPack") && focus && pack && (
          <Card
            title="Pre-delivery pack"
            icon={ClipboardCheck}
            action={
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copy(`${pack.summary}\n\nTesting checklist:\n${pack.testing.map((t) => `- ${t}`).join("\n")}\n\nHandover notes:\n${pack.handover.map((h) => `- ${h}`).join("\n")}`)}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            }
          >
            <p
              className={cn(
                "mb-3 inline-flex rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold",
                pack.ready
                  ? "border-success/25 bg-success/12 text-success"
                  : "border-warning/30 bg-warning/15 text-warning",
              )}
            >
              {pack.ready ? "Ready to deliver" : `${pack.outstanding.length} milestone(s) outstanding`}
            </p>
            <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{pack.summary}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Testing checklist
            </p>
            <ul className="mt-1 space-y-1">
              {pack.testing.map((t) => (
                <li key={t} className="flex gap-2 text-xs">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Handover notes</p>
            <ul className="mt-1 space-y-1">
              {pack.handover.map((h) => (
                <li key={h} className="text-xs text-muted-foreground">
                  • {h}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Portfolio */}
      {isOn("portfolio") && focus && portfolio && (
        <Card
          title="Freelancer portfolio draft"
          icon={Sparkles}
          action={
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                copy(
                  [
                    `Title: ${portfolio.title}`,
                    `Description: ${portfolio.description}`,
                    `Tags: ${portfolio.tags.join(", ")}`,
                    `Software used: ${portfolio.software.join(", ")}`,
                    `Skills: ${portfolio.skills.join(", ")}`,
                    `Industry: ${portfolio.industry}`,
                    `Images: ${portfolio.images.join(" | ")}`,
                  ].join("\n"),
                )
              }
            >
              <Copy className="h-3.5 w-3.5" /> Copy for Freelancer.com
            </Button>
          }
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Portfolio title", portfolio.title],
                ["Industry", portfolio.industry],
                ["Description", portfolio.description],
                ["Tags", portfolio.tags.join(", ")],
                ["Software used", portfolio.software.join(", ")],
                ["Skills", portfolio.skills.join(", ")],
                ["Project images", portfolio.images.join(" · ")],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-surface-2/50 p-3">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-xs leading-relaxed">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      {/* Toggles */}
      <Card title="Automation controls" icon={Wand2}>
        <div className="grid gap-2 md:grid-cols-2">
          {automationCatalog.map((a) => {
            const on = isOn(a.key);
            return (
              <div
                key={a.key}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/40 p-3 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                  <span className="mt-1.5 inline-block rounded-full border border-border bg-surface px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                    {a.category}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={`Toggle ${a.title}`}
                  onClick={() => toggle(a.key)}
                  className={cn(
                    "mt-1 h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on ? "brand-gradient" : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "block h-4 w-4 rounded-full bg-background shadow transition-transform duration-200",
                      on ? "translate-x-4" : "translate-x-0",
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
