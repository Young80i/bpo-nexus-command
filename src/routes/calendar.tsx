import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Flag, Package, Rocket, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/projects-store";
import { useWorkspace } from "@/lib/workspace-store";
import { tasks as seedTasks } from "@/data/tasks";
import {
  buildCalendarEvents,
  calendarEventTypes,
  type CalendarEvent,
  type CalendarEventType,
} from "@/data/calendar";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — BPO Nexus" },
      {
        name: "description",
        content:
          "Day, week, month and agenda views of deadlines, milestones, meetings, deliveries and project dates.",
      },
      { property: "og:title", content: "Calendar — BPO Nexus" },
      {
        property: "og:description",
        content: "Delivery calendar for deadlines, milestones, meetings and deliveries.",
      },
    ],
  }),
  component: CalendarPage,
});

const views = ["Day", "Week", "Month", "Agenda"] as const;
type View = (typeof views)[number];

const typeMeta: Record<CalendarEventType, { color: string; dot: string; icon: typeof Flag }> = {
  Deadline: { color: "bg-destructive/12 text-destructive border-destructive/25", dot: "bg-destructive", icon: Clock },
  Milestone: { color: "bg-primary/12 text-primary border-primary/25", dot: "bg-primary", icon: Flag },
  Meeting: { color: "bg-info/12 text-info border-info/25", dot: "bg-info", icon: Users },
  Delivery: { color: "bg-success/12 text-success border-success/25", dot: "bg-success", icon: Package },
  "Project Start": { color: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning", icon: Rocket },
  "Project End": { color: "bg-accent text-accent-foreground border-border", dot: "bg-accent-foreground/60", icon: Target },
};

function EventPill({
  event,
  projectName,
  onSelect,
  compact,
}: {
  event: CalendarEvent;
  projectName: string;
  onSelect: () => void;
  compact?: boolean;
}) {
  const meta = typeMeta[event.type];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full truncate rounded-md border px-1.5 py-1 text-left text-[0.68rem] font-medium transition-all duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        meta.color,
      )}
      title={`${event.title} — ${projectName}`}
    >
      <span className="flex items-center gap-1">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dot)} />
        {event.time && !compact && <span className="shrink-0 tabular-nums opacity-80">{event.time}</span>}
        <span className="truncate">{event.title}</span>
      </span>
    </button>
  );
}

function CalendarPage() {
  const { projects } = useProjects();
  const { milestones } = useWorkspace();
  const [view, setView] = useState<View>("Month");
  const [cursor, setCursor] = useState(() => new Date());
  const [active, setActive] = useState<CalendarEventType[]>([...calendarEventTypes]);
  const [projectFilter, setProjectFilter] = useState("all");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const projectName = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])) as Record<string, string>,
    [projects],
  );

  const events = useMemo(() => {
    const all = buildCalendarEvents(projects, milestones, seedTasks);
    return all.filter(
      (e) => active.includes(e.type) && (projectFilter === "all" || e.projectId === projectFilter),
    );
  }, [projects, milestones, active, projectFilter]);

  const eventsOn = (day: Date) => events.filter((e) => isSameDay(parseISO(e.date), day));

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const days: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
    return days;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const agenda = useMemo(() => {
    const from = new Date(new Date().toISOString().slice(0, 10));
    const grouped = new Map<string, CalendarEvent[]>();
    events
      .filter((e) => parseISO(e.date) >= from)
      .slice(0, 60)
      .forEach((e) => grouped.set(e.date, [...(grouped.get(e.date) ?? []), e]));
    return [...grouped.entries()];
  }, [events]);

  const step = (dir: number) => {
    if (view === "Month") setCursor((c) => addMonths(c, dir));
    else if (view === "Week") setCursor((c) => addDays(c, dir * 7));
    else setCursor((c) => addDays(c, dir));
  };

  const label =
    view === "Month"
      ? format(cursor, "MMMM yyyy")
      : view === "Week"
        ? `${format(weekDays[0], "d MMM")} – ${format(weekDays[6], "d MMM yyyy")}`
        : view === "Day"
          ? format(cursor, "EEEE d MMMM yyyy")
          : "Next 60 events";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Calendar"
        description="Deadlines, milestones, meetings, deliveries and project dates in one timeline"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
              {views.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                    view === v
                      ? "brand-gradient text-primary-foreground shadow-[var(--shadow-soft)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
              Today
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Previous" onClick={() => step(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[13rem] text-sm font-semibold">{label}</span>
          <Button variant="ghost" size="icon-sm" aria-label="Next" onClick={() => step(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <select
          className="field h-8 w-auto min-w-[10rem]"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          aria-label="Filter by project"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-1.5">
          {calendarEventTypes.map((t) => {
            const on = active.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setActive((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold transition-all duration-200",
                  on ? typeMeta[t].color : "border-border bg-surface text-muted-foreground opacity-70",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", typeMeta[t].dot)} />
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="surface-card overflow-hidden">
          {view === "Month" && (
            <div>
              <div className="grid grid-cols-7 border-b border-border bg-surface-2/60">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="px-2 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const dayEvents = eventsOn(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[7rem] border-b border-r border-border p-1.5 transition-colors",
                        !isSameMonth(day, cursor) && "bg-surface-2/40 text-muted-foreground",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCursor(day);
                          setView("Day");
                        }}
                        className={cn(
                          "mb-1 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold transition-colors hover:bg-accent",
                          isToday(day) && "brand-gradient text-primary-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </button>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((e) => (
                          <EventPill
                            key={e.id}
                            event={e}
                            compact
                            projectName={projectName[e.projectId] ?? ""}
                            onSelect={() => setSelected(e)}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="pl-1 text-[0.65rem] font-medium text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "Week" && (
            <div className="grid grid-cols-1 sm:grid-cols-7">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="min-h-[16rem] border-b border-r border-border p-2">
                  <p className={cn("mb-2 text-xs font-semibold", isToday(day) && "text-primary")}>
                    {format(day, "EEE d")}
                  </p>
                  <div className="space-y-1.5">
                    {eventsOn(day).map((e) => (
                      <EventPill
                        key={e.id}
                        event={e}
                        projectName={projectName[e.projectId] ?? ""}
                        onSelect={() => setSelected(e)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === "Day" && (
            <div className="divide-y divide-border">
              {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => {
                const slot = eventsOn(cursor).filter((e) => {
                  const h = e.time ? Number(e.time.slice(0, 2)) : 9;
                  return h === hour;
                });
                return (
                  <div key={hour} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 px-3 py-2">
                    <span className="pt-1 text-xs font-medium tabular-nums text-muted-foreground">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                    <div className="space-y-1.5">
                      {slot.length === 0 ? (
                        <div className="h-6 rounded-md border border-dashed border-border/60" />
                      ) : (
                        slot.map((e) => (
                          <EventPill
                            key={e.id}
                            event={e}
                            projectName={projectName[e.projectId] ?? ""}
                            onSelect={() => setSelected(e)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "Agenda" && (
            <div className="divide-y divide-border">
              {agenda.map(([date, list]) => (
                <div key={date} className="grid gap-3 p-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
                  <div>
                    <p className="text-sm font-semibold">{format(parseISO(date), "EEE d MMM")}</p>
                    <p className="text-xs text-muted-foreground">{list.length} events</p>
                  </div>
                  <div className="space-y-2">
                    {list.map((e) => {
                      const Icon = typeMeta[e.type].icon;
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setSelected(e)}
                          className="lift flex w-full items-start gap-3 rounded-lg border border-border bg-surface-2/50 p-3 text-left"
                        >
                          <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border", typeMeta[e.type].color)}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{e.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {projectName[e.projectId] ?? "—"} · {e.detail}
                            </span>
                          </span>
                          {e.time && (
                            <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">{e.time}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {agenda.length === 0 && (
                <p className="p-10 text-center text-sm text-muted-foreground">No upcoming events match these filters.</p>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="surface-card p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-primary" /> Selected event
            </h2>
            {selected ? (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-base font-semibold leading-tight">{selected.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(parseISO(selected.date), "EEEE d MMMM yyyy")}
                    {selected.time ? ` · ${selected.time}` : ""}
                    {selected.durationMins ? ` · ${selected.durationMins} min` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold",
                    typeMeta[selected.type].color,
                  )}
                >
                  {selected.type}
                </span>
                <p className="text-sm text-muted-foreground">{selected.detail}</p>
                <p className="text-xs">
                  <span className="text-muted-foreground">Project: </span>
                  <span className="font-medium">{projectName[selected.projectId] ?? "—"}</span>
                </p>
                {selected.attendees && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Attendees: </span>
                    <span className="font-medium">{selected.attendees.join(", ")}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Select any event to see its details, project and attendees.
              </p>
            )}
          </div>

          <div className="surface-card p-4">
            <h2 className="text-sm font-semibold">This month at a glance</h2>
            <ul className="mt-3 space-y-2">
              {calendarEventTypes.map((t) => {
                const count = events.filter(
                  (e) => e.type === t && isSameMonth(parseISO(e.date), cursor),
                ).length;
                return (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <span className={cn("h-2 w-2 rounded-full", typeMeta[t].dot)} />
                    <span className="text-muted-foreground">{t}</span>
                    <span className="ml-auto font-semibold tabular-nums">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
