import { createFileRoute } from "@tanstack/react-router";
import { EmptyPage } from "@/components/layout/app-shell";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — BPO Nexus" },
      { name: "description", content: "Deadlines, demos and milestone dates across the delivery portfolio." },
      { property: "og:title", content: "Calendar — BPO Nexus" },
      { property: "og:description", content: "Delivery calendar for deadlines, demos and milestones." },
    ],
  }),
  component: () => (
    <EmptyPage
      title="Calendar"
      description="Deadlines, demos and milestone dates"
      note="A month and timeline view of delivery dates will be built here."
    />
  ),
});
