import { clients, projects } from "./demo";
import { milestones } from "./workspace";

export const fileKinds = [
  "Image",
  "Video",
  "Audio",
  "Document",
  "PDF",
  "Spreadsheet",
  "Presentation",
  "ZIP",
  "Source Code",
  "Game Asset",
  "Data",
  "Other",
] as const;
export type FileKind = (typeof fileKinds)[number];

export type VaultFile = {
  id: string;
  name: string;
  kind: FileKind;
  size: string;
  uploaded: string;
  uploadedBy: string;
  clientId: string;
  projectId: string;
  milestoneId: string | null;
  description: string;
  preview: string | null;
  /** Data URL for files uploaded in this workspace (small files only). */
  dataUrl?: string | null;
  mime?: string | null;
};


const seeds: { name: string; kind: FileKind; size: string; description: string; preview?: string }[] = [
  {
    name: "brand-hero-shot.png",
    kind: "Image",
    size: "4.2 MB",
    description: "Approved hero image for the marketing landing page.",
    preview: "image",
  },
  {
    name: "sprint-demo-recording.mp4",
    kind: "Video",
    size: "184 MB",
    description: "Screen recording of the sprint 6 client demo.",
    preview: "video",
  },
  {
    name: "statement-of-work.docx",
    kind: "Document",
    size: "268 KB",
    description: "Signed statement of work with milestone schedule.",
  },
  {
    name: "technical-specification.pdf",
    kind: "PDF",
    size: "1.8 MB",
    description: "Full technical specification including data model and API contracts.",
  },
  {
    name: "design-export-bundle.zip",
    kind: "ZIP",
    size: "62 MB",
    description: "Exported design assets, icons and illustration source files.",
  },
  {
    name: "api-gateway.ts",
    kind: "Source Code",
    size: "38 KB",
    description: "Edge gateway handler with request validation and rate limiting.",
    preview: "code",
  },
  {
    name: "character-rig-hero.fbx",
    kind: "Game Asset",
    size: "96 MB",
    description: "Rigged hero character with animation set for the game build.",
  },
  {
    name: "level-01-blockout.unitypackage",
    kind: "Game Asset",
    size: "212 MB",
    description: "Level one blockout with lighting probes and nav mesh.",
  },
  {
    name: "qa-regression-report.pdf",
    kind: "PDF",
    size: "940 KB",
    description: "Regression results across the supported device matrix.",
  },
  {
    name: "onboarding-walkthrough.mp4",
    kind: "Video",
    size: "78 MB",
    description: "Narrated walkthrough of the onboarding flow for client sign-off.",
    preview: "video",
  },
  {
    name: "dashboard-mockup.jpg",
    kind: "Image",
    size: "2.7 MB",
    description: "Final executive dashboard mockup used for approval.",
    preview: "image",
  },
  {
    name: "migration-0007.sql",
    kind: "Source Code",
    size: "22 KB",
    description: "Schema migration adding reporting tables and indexes.",
    preview: "code",
  },
];

const uploaders = ["You", "Priya N.", "Andrés L.", "Mei T.", "Client"];

const codePreview = `export async function handler(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return json({ error: "invalid" }, 400);
  return json(await service.process(parsed.data));
}`;

export const vaultFiles: VaultFile[] = projects.slice(0, 8).flatMap((project, pi) => {
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  return seeds.slice(0, 5 + (pi % 5)).map((s, i) => {
    const ms = projectMilestones[(pi + i) % Math.max(1, projectMilestones.length)] ?? null;
    const d = new Date("2026-07-28T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - ((pi * 7 + i * 4) % 90));
    return {
      id: `f${pi + 1}-${i + 1}`,
      name: s.name,
      kind: s.kind,
      size: s.size,
      uploaded: d.toISOString().slice(0, 10),
      uploadedBy: uploaders[(pi + i) % uploaders.length],
      clientId: project.clientId,
      projectId: project.id,
      milestoneId: i % 4 === 3 ? null : (ms?.id ?? null),
      description: s.description,
      preview: s.preview === "code" ? codePreview : (s.preview ?? null),
    };
  });
});

export function clientName(id: string) {
  return clients.find((c) => c.id === id)?.company ?? "Unassigned";
}
