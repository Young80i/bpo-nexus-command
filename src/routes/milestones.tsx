import { createFileRoute } from "@tanstack/react-router";
import { EmptyPage } from "@/components/layout/app-shell";

export const Route = createFileRoute("/milestones")({
  head: () => ({
    meta: [
      { title: "Milestones — BPO Nexus" },
      { name: "description", content: "Track milestone releases, payments and client approvals across all engagements." },
      { property: "og:title", content: "Milestones — BPO Nexus" },
      { property: "og:description", content: "Milestone releases, payments and approvals in one timeline." },
    ],
  }),
  component: () => (
    <EmptyPage
      title="Milestones"
      description="Milestone releases, payments and approvals"
      note="A milestone timeline with payment status and client sign-off will be built here."
    />
  ),
});
