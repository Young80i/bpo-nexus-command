import { createFileRoute } from "@tanstack/react-router";
import { EmptyPage } from "@/components/layout/app-shell";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — BPO Nexus" },
      { name: "description", content: "Deep-dive reporting on margin, utilisation, win rate and delivery velocity." },
      { property: "og:title", content: "Analytics — BPO Nexus" },
      { property: "og:description", content: "Margin, utilisation and velocity reporting for outsourcing delivery." },
    ],
  }),
  component: () => (
    <EmptyPage
      title="Analytics"
      description="Margin, utilisation and delivery velocity"
      note="Deep-dive reports and exportable board packs will be added here."
    />
  ),
});
