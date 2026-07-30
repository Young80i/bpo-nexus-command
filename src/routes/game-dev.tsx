import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, Bug, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { ProgressBar } from "@/components/badges";
import { gameTracks, trackCompletion, type GameStage } from "@/data/game";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/game-dev")({
  head: () => ({
    meta: [
      { title: "Game Development — Build Timeline | BPO Nexus" },
      {
        name: "description",
        content:
          "Track game builds across story, characters, UI, gameplay, physics, audio, assets, levels, testing, publishing and bug fixes.",
      },
      { property: "og:title", content: "Game Development — BPO Nexus" },
      { property: "og:description", content: "A modern timeline for game production progress and bug triage." },
    ],
  }),
  component: GameDevPage,
});

function GameDevPage() {
  const [trackId, setTrackId] = useState(gameTracks[0]?.projectId ?? "");
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const track = gameTracks.find((t) => t.projectId === trackId) ?? gameTracks[0];

  const stages = useMemo(
    () =>
      (track?.stages ?? []).map((s) => ({
        ...s,
        progress: overrides[`${track?.projectId}:${s.stage}`] ?? s.progress,
      })),
    [track, overrides],
  );

  const overall = trackCompletion(stages);
  const openBugs = stages.reduce((s, x) => s + x.openBugs, 0);
  const shipped = stages.filter((s) => s.progress === 100).length;

  const setProgress = (stage: GameStage, value: number) =>
    setOverrides((prev) => ({ ...prev, [`${track?.projectId}:${stage}`]: value }));

  if (!track) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Game Development"
        description="Production pipeline from narrative design through publishing and post-launch fixes"
        actions={
          <select
            value={track.projectId}
            onChange={(e) => setTrackId(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {gameTracks.map((t) => (
              <option key={t.projectId} value={t.projectId}>
                {t.title}
              </option>
            ))}
          </select>
        }
      />

      <section className="surface-card mb-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl brand-gradient text-primary-foreground">
              <Gamepad2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold">{track.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {track.engine} · {track.platforms.join(" / ")} · build {track.build}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Completion</p>
            <p className="font-display text-3xl font-bold">{overall}%</p>
          </div>
        </div>

        <ProgressBar value={overall} className="mt-4 h-2" />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Stages complete", value: `${shipped}/${stages.length}` },
            { label: "Open bugs", value: String(openBugs) },
            { label: "Stages in flight", value: String(stages.filter((s) => s.progress > 0 && s.progress < 100).length) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-[0.7rem] font-medium text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-1.5">
          {stages.map((s) => (
            <div
              key={s.stage}
              title={`${s.stage} — ${s.progress}%`}
              className={cn(
                "h-2 flex-1 rounded-full",
                s.progress === 100 ? "bg-success" : s.progress > 0 ? "bg-primary/60" : "bg-surface-2",
              )}
            />
          ))}
        </div>
      </section>

      <ol className="relative space-y-4 border-l border-border pl-8">
        {stages.map((s) => {
          const done = s.progress === 100;
          const active = s.progress > 0 && !done;
          return (
            <li key={s.stage} className="relative">
              <span
                className={cn(
                  "absolute -left-[2.35rem] top-4 grid h-6 w-6 place-items-center rounded-full border bg-background",
                  done ? "border-success text-success" : active ? "border-primary text-primary" : "border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <div className="surface-card lift p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold">{s.stage}</p>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.66rem] text-muted-foreground">{s.owner}</span>
                  {s.openBugs > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/12 px-2 py-0.5 text-[0.66rem] font-semibold text-destructive">
                      <Bug className="h-3 w-3" /> {s.openBugs} open
                    </span>
                  )}
                  <span
                    className={cn(
                      "ml-auto font-display text-sm font-bold",
                      done ? "text-success" : active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {s.progress}%
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
                <ProgressBar value={s.progress} className="mt-3" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={s.progress}
                  onChange={(e) => setProgress(s.stage, Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
