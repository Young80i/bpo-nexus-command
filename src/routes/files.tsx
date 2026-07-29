import { createFileRoute } from "@tanstack/react-router";
import { EmptyPage } from "@/components/layout/app-shell";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "Files — BPO Nexus" },
      { name: "description", content: "Central document vault for contracts, specs and client deliverables." },
      { property: "og:title", content: "Files — BPO Nexus" },
      { property: "og:description", content: "Contracts, specifications and deliverables in one vault." },
    ],
  }),
  component: () => (
    <EmptyPage
      title="Files"
      description="Contracts, specifications and deliverables"
      note="A searchable document vault with per-project and per-client folders is planned here."
    />
  ),
});
