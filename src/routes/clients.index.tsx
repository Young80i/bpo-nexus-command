import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpDown, Search, Star, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { clients } from "@/data/demo";

export const Route = createFileRoute("/clients/")({
  head: () => ({
    meta: [
      { title: "Clients — BPO Nexus CRM" },
      {
        name: "description",
        content: "Search, filter and manage every Freelancer.com client: revenue, ratings, contacts and project history.",
      },
      { property: "og:title", content: "Clients — BPO Nexus CRM" },
      { property: "og:description", content: "A modern CRM for outsourcing clients, revenue and engagement history." },
    ],
  }),
  component: ClientsPage,
});

const sorts = ["Revenue", "Projects", "Rating", "Name"] as const;

function ClientsPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Revenue");

  const countries = ["All", ...Array.from(new Set(clients.map((c) => c.country)))];

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return clients
      .filter(
        (c) =>
          (country === "All" || c.country === country) &&
          (status === "All" || c.status === status) &&
          (!q ||
            c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.freelancerUsername.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        if (sort === "Name") return a.name.localeCompare(b.name);
        if (sort === "Projects") return b.totalProjects - a.totalProjects;
        if (sort === "Rating") return b.rating - a.rating;
        return b.totalRevenue - a.totalRevenue;
      });
  }, [query, country, status, sort]);

  const totalRevenue = clients.reduce((s, c) => s + c.totalRevenue, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Clients"
        description={`${clients.length} accounts · $${totalRevenue.toLocaleString()} lifetime revenue`}
        actions={
          <Button size="sm" className="gap-1.5">
            <UserPlus className="h-4 w-4" /> Add Client
          </Button>
        }
      />

      <div className="surface-card flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, company, username or email"
            className="h-9 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-primary/50"
        >
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus:border-primary/50"
        >
          {["All", "Active", "Prospect", "Dormant"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-sm">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
            className="h-9 bg-transparent text-sm outline-none"
          >
            {sorts.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((c) => (
          <Link
            key={c.id}
            to="/clients/$clientId"
            params={{ clientId: c.id }}
            className="surface-card lift block p-5"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl brand-gradient text-sm font-bold text-primary-foreground">
                {c.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.company}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-warning/12 px-2 py-0.5 text-xs font-semibold text-warning">
                <Star className="h-3 w-3 fill-current" />
                {c.rating.toFixed(1)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-border bg-surface-2 p-3 text-center">
              <div>
                <p className="text-sm font-bold">{c.totalProjects}</p>
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Projects</p>
              </div>
              <div>
                <p className="text-sm font-bold">${(c.totalRevenue / 1000).toFixed(1)}k</p>
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Revenue</p>
              </div>
              <div>
                <p className="text-sm font-bold">{c.countryCode}</p>
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{c.country.slice(0, 10)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="truncate">{c.freelancerUsername}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${
                  c.status === "Active"
                    ? "bg-success/12 text-success"
                    : c.status === "Prospect"
                      ? "bg-info/12 text-info"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {c.status}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="surface-card grid place-items-center p-12 text-sm text-muted-foreground">
          No clients match those filters.
        </div>
      )}
    </div>
  );
}
