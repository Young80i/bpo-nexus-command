import { projects } from "./demo";

export const gameStages = [
  "Story",
  "Characters",
  "UI",
  "Gameplay",
  "Physics",
  "Audio",
  "Assets",
  "Levels",
  "Testing",
  "Publishing",
  "Bug Fixes",
] as const;

export type GameStage = (typeof gameStages)[number];

export type GameStageProgress = {
  stage: GameStage;
  progress: number;
  owner: string;
  note: string;
  openBugs: number;
};

export type GameTrack = {
  projectId: string;
  title: string;
  engine: string;
  platforms: string[];
  build: string;
  stages: GameStageProgress[];
};

const notes: Record<GameStage, string> = {
  Story: "Narrative bible, branching dialogue tree and cutscene beats approved by the client.",
  Characters: "Hero, rival and 6 NPC rigs with animation sets and ability trees.",
  UI: "HUD, inventory, settings and store screens built against the design system.",
  Gameplay: "Core loop, progression curve, save system and difficulty tuning.",
  Physics: "Collision layers, ragdoll tuning, vehicle handling and projectile ballistics.",
  Audio: "Adaptive score, SFX bank, VO placeholders and mix bus routing.",
  Assets: "Environment kits, props, VFX and texture atlas optimisation.",
  Levels: "12 handcrafted levels plus procedural side arenas and lighting bakes.",
  Testing: "Playtests, automated smoke runs, device matrix and performance profiling.",
  Publishing: "Store listings, ratings submissions, build pipelines and launch checklist.",
  "Bug Fixes": "Triage board for crash, blocker and polish issues ahead of gold master.",
};

const owners = ["Priya N.", "Andrés L.", "Rafael M.", "Mei T.", "You", "Jonas K."];
const engines = ["Unity 6", "Unreal Engine 5.4", "Godot 4.3"];
const platformSets = [
  ["PC", "Steam Deck"],
  ["iOS", "Android"],
  ["PC", "PS5", "Xbox Series"],
  ["WebGL", "iOS"],
];

const weights = [1.4, 1.3, 1.2, 1.05, 0.95, 0.9, 1.1, 0.85, 0.7, 0.45, 0.6];

export const gameTracks: GameTrack[] = projects.slice(0, 6).map((project, pi) => ({
  projectId: project.id,
  title: `${project.name} — Game Build`,
  engine: engines[pi % engines.length],
  platforms: platformSets[pi % platformSets.length],
  build: `v0.${pi + 4}.${(pi * 3 + 2) % 9}-rc`,
  stages: gameStages.map((stage, i) => {
    const raw = Math.round(project.progress * weights[i]);
    const progress = Math.max(0, Math.min(100, Math.round(raw / 5) * 5));
    return {
      stage,
      progress,
      owner: owners[(pi + i) % owners.length],
      note: notes[stage],
      openBugs: stage === "Bug Fixes" ? 6 + ((pi * 3) % 11) : Math.max(0, 4 - Math.floor(progress / 25)),
    };
  }),
}));

export function trackCompletion(stages: GameStageProgress[]) {
  if (!stages.length) return 0;
  return Math.round(stages.reduce((s, x) => s + x.progress, 0) / stages.length);
}
