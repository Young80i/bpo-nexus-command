import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Globe2,
  Mail,
  Paperclip,
  Phone,
  Star,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { ProgressBar, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { clients, formatMoney, projects } from "@/data/demo";

export const Route = createFileRoute("/clients/$clientId")({
  loader: ({ params }) => {
    const client = clients.find((c) => c.id === params.clientId);
    if (!client) throw notFound();
    return { client };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Client not found — BPO Nexus" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.client.name} — Client Profile | BPO Nexus`;
    const description = `${loaderData.client.company} · ${loaderData.client.totalProjects} projects · lifetime revenue and engagement history.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ClientProfile,
});

function ClientProfile() {
  const { clientId } = Route.useParams();
  const client = clients.find((c) => c.id === clientId)!;
  const history = projects.filter((p) => p.clientId === client.id);

  const facts = [
    { icon: Building2, label: "Company", value: client.company },
    { icon: Globe2, label: "Country", value: client.country },
    { icon: UserRound, label: "Freelancer", value: client.freelancerUsername },
    { icon: Mail, label: "Email", value: client.email },
    { icon: Phone, label: "Phone", value: client.phone },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>

      <div className="surface-card overflow-hidden">
        <div className="h-24 brand-gradient" />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-6 pb-6 sm:flex sm:flex-wrap sm:justify-between">
          <div className="-mt-10 flex min-w-0 items-end gap-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-surface bg-surface-2 font-display text-xl font-bold">
              {client.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-xl font-bold sm:text-2xl">{client.name}</h1>
              <p className="truncate text-sm text-muted-foreground">
                {client.company} · client since {client.since}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 pb-1">
            <span className="flex items-center gap-1 rounded-full bg-warning/12 px-3 py-1 text-sm font-semibold text-warning">
              <Star className="h-3.5 w-3.5 fill-current" /> {client.rating.toFixed(1)}
            </span>
            <Button variant="outline" size="sm">
              Message
            </Button>
            <Button size="sm">Edit client</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="mb-4 text-base font-semibold">Contact details</h2>
            <dl className="space-y-3">
              {facts.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{f.label}</dt>
                    <dd className="truncate text-sm font-medium">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface-card grid grid-cols-2 gap-3 p-5">
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="font-display text-xl font-bold">{client.totalProjects}</p>
              <p className="text-xs text-muted-foreground">Total projects</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="font-display text-xl font-bold">${(client.totalRevenue / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Total revenue</p>
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="mb-3 text-base font-semibold">Attachments</h2>
            {client.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files attached to this account yet.</p>
            ) : (
              <ul className="space-y-2">
                {client.attachments.map((a) => (
                  <li
                    key={a.name}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2"
                  >
                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{a.name}</p>
                      <p className="text-[0.7rem] text-muted-foreground">
                        {a.type} · {a.size} · {a.date}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="surface-card p-5">
            <h2 className="mb-2 text-base font-semibold">Account notes</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{client.notes}</p>
          </div>

          <div className="surface-card p-5">
            <h2 className="mb-4 text-base font-semibold">Project history</h2>
            <div className="space-y-3">
              {history.map((p) => (
                <div key={p.id} className="lift rounded-xl border border-border bg-surface-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{formatMoney(p.budget, p.currency)}</span>
                    <span>
                      {p.startDate} → {p.dueDate}
                    </span>
                    <span>
                      {p.actualHours}h / {p.estimatedHours}h
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={p.progress} />
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
