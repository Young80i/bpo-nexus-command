import { createFileRoute } from "@tanstack/react-router";
import { EmptyPage } from "@/components/layout/app-shell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BPO Nexus" },
      { name: "description", content: "Workspace, team, billing and integration settings for BPO Nexus." },
      { property: "og:title", content: "Settings — BPO Nexus" },
      { property: "og:description", content: "Workspace, team and integration configuration." },
    ],
  }),
  component: () => (
    <EmptyPage
      title="Settings"
      description="Workspace, team and integrations"
      note="Profile, team roles, Freelancer.com sync and billing preferences will live here."
    />
  ),
});
