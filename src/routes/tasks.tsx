import { createFileRoute } from "@tanstack/react-router";
import { EmptyPage } from "@/components/layout/app-shell";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — BPO Nexus" },
      { name: "description", content: "Assign, prioritise and track delivery tasks for every outsourcing project." },
      { property: "og:title", content: "Tasks — BPO Nexus" },
      { property: "og:description", content: "Delivery task tracking for your outsourcing team." },
    ],
  }),
  component: () => (
    <EmptyPage
      title="Tasks"
      description="Team task assignment and delivery tracking"
      note="Task lists, assignees, estimates and sprint grouping will be added in a later pass."
    />
  ),
});
