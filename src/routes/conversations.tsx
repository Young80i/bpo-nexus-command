import { createFileRoute } from "@tanstack/react-router";
import { EmptyPage } from "@/components/layout/app-shell";

export const Route = createFileRoute("/conversations")({
  head: () => ({
    meta: [
      { title: "Conversations — BPO Nexus" },
      { name: "description", content: "Unified inbox for Freelancer.com client messages across every active project." },
      { property: "og:title", content: "Conversations — BPO Nexus" },
      { property: "og:description", content: "Unified client inbox for your outsourcing delivery team." },
    ],
  }),
  component: () => (
    <EmptyPage
      title="Conversations"
      description="Unified client inbox across Freelancer.com threads"
      note="Client threads, AI-drafted replies and message search will live here."
    />
  ),
});
