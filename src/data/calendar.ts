import { projects, type Project } from "./demo";
import type { Milestone } from "./workspace";
import type { Task } from "./tasks";

export const calendarEventTypes = [
  "Deadline",
  "Milestone",
  "Meeting",
  "Delivery",
  "Project Start",
  "Project End",
] as const;

export type CalendarEventType = (typeof calendarEventTypes)[number];

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  time?: string; // HH:mm
  durationMins?: number;
  type: CalendarEventType;
  projectId: string;
  detail: string;
  attendees?: string[];
};

const shift = (iso: string, days: number) => {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const meetingSeeds: { title: string; offset: number; time: string; mins: number; attendees: string[]; detail: string }[] = [
  {
    title: "Sprint demo & feedback",
    offset: 1,
    time: "10:00",
    mins: 45,
    attendees: ["You", "Client", "Priya N."],
    detail: "Walk through the current build and capture revision notes.",
  },
  {
    title: "Requirements workshop",
    offset: 3,
    time: "14:30",
    mins: 60,
    attendees: ["You", "Client"],
    detail: "Clarify outstanding functional requirements and acceptance criteria.",
  },
  {
    title: "Weekly progress call",
    offset: 5,
    time: "09:15",
    mins: 30,
    attendees: ["You", "Client", "Andrés L."],
    detail: "Status, blockers and the plan for the coming week.",
  },
  {
    title: "Design review",
    offset: 8,
    time: "16:00",
    mins: 45,
    attendees: ["You", "Mei T."],
    detail: "Review hi-fi screens before frontend implementation starts.",
  },
  {
    title: "Technical handover",
    offset: 12,
    time: "11:00",
    mins: 60,
    attendees: ["You", "Client", "Rafael M."],
    detail: "Repository walkthrough, deployment and post-delivery support.",
  },
  {
    title: "Kick-off call",
    offset: -2,
    time: "13:00",
    mins: 45,
    attendees: ["You", "Client"],
    detail: "Scope confirmation, milestones and communication cadence.",
  },
];

const deliverySeeds: { title: string; offset: number; detail: string }[] = [
  { title: "Staging build delivery", offset: 2, detail: "Deploy the reviewed build to staging and share access." },
  { title: "Milestone package delivery", offset: 6, detail: "Send deliverables and request milestone release." },
  { title: "Final source code delivery", offset: 10, detail: "Repository transfer, docs and credentials handover." },
  { title: "Revision round delivery", offset: -1, detail: "Delivered revision round 2 with client feedback applied." },
];

export const meetings: CalendarEvent[] = meetingSeeds.map((m, i) => {
  const project = projects[i % Math.max(1, projects.length)];
  return {
    id: `meet-${i}`,
    title: m.title,
    date: shift(todayIso(), m.offset),
    time: m.time,
    durationMins: m.mins,
    type: "Meeting",
    projectId: project?.id ?? "",
    detail: m.detail,
    attendees: m.attendees,
  };
});

export const deliveries: CalendarEvent[] = deliverySeeds.map((d, i) => {
  const project = projects[(i + 2) % Math.max(1, projects.length)];
  return {
    id: `deliv-${i}`,
    title: d.title,
    date: shift(todayIso(), d.offset),
    time: "17:00",
    type: "Delivery",
    projectId: project?.id ?? "",
    detail: d.detail,
  };
});

export function buildCalendarEvents(
  projectList: Project[],
  milestoneList: Milestone[],
  taskList: Task[],
): CalendarEvent[] {
  const events: CalendarEvent[] = [...meetings, ...deliveries];

  for (const p of projectList) {
    if (p.archived) continue;
    events.push({
      id: `ps-${p.id}`,
      title: `${p.name} starts`,
      date: p.startDate,
      type: "Project Start",
      projectId: p.id,
      detail: `Kick-off for ${p.name}.`,
    });
    events.push({
      id: `pe-${p.id}`,
      title: `${p.name} delivery date`,
      date: p.dueDate,
      type: "Project End",
      projectId: p.id,
      detail: `Contracted end date · ${p.progress}% complete.`,
    });
  }

  for (const m of milestoneList) {
    if (m.stage === "Cancelled") continue;
    events.push({
      id: `ms-${m.id}`,
      title: m.title,
      date: m.deadline,
      type: "Milestone",
      projectId: m.projectId,
      detail: `${m.stage} · ${m.progress}% · ${m.deliverables.length} deliverables`,
    });
  }

  for (const t of taskList) {
    if (t.status === "Done") continue;
    events.push({
      id: `tk-${t.id}`,
      title: t.title,
      date: t.dueDate.slice(0, 10),
      type: "Deadline",
      projectId: t.projectId,
      detail: `${t.priority} priority · ${t.assignee} · ${t.progress}%`,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
}
