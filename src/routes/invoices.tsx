import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus, DollarSign, Download, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// SUPABASE HOOKS
import { useSupabaseProjects } from "@/lib/supabase/hooks/useSupabaseProjects";
import { useSupabaseClients } from "@/lib/supabase/hooks/useSupabaseClients";
import { useSupabaseInvoices } from "@/lib/supabase/hooks/useSupabaseInvoices";
import { formatMoney } from "@/data/demo";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices & Billing — BPO Nexus" },
      { name: "description", content: "Manage project billings, payments, and client invoices." }
    ],
  }),
  component: InvoicesPage,
});

const statusTone: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  Sent: "bg-info/12 text-info border-info/25",
  Paid: "bg-success/12 text-success border-success/25",
  Overdue: "bg-destructive/12 text-destructive border-destructive/25",
};

function InvoicesPage() {
  const { projects } = useSupabaseProjects();
  const { clients } = useSupabaseClients();
  const { invoices: dbInvoices, addInvoice, updateInvoice, deleteInvoice } = useSupabaseInvoices();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [openDetail, setOpenDetail] = useState<any | null>(null);

  const clientName = (id: string) => clients.find((c: any) => c.id === id)?.company ?? "Direct Client";
  const projectName = (id: string) => projects.find((p: any) => p.id === id)?.name ?? "General Project";

  // Map DB invoices to UI structure
  const invoices = useMemo(() => dbInvoices.map((inv: any) => ({
    id: inv.id,
    invoiceNumber: inv.invoice_number || "INV-001",
    clientId: inv.client_id || "",
    projectId: inv.project_id || "",
    status: inv.status || "Draft",
    amount: Number(inv.amount) || 0,
    currency: inv.currency || "USD",
    dueDate: inv.due_date ? new Date(inv.due_date).toISOString().slice(0, 10) : "No due date",
    lineItems: inv.line_items || [],
    createdAt: inv.created_at
  })), [dbInvoices]);

  const filtered = useMemo(() => invoices.filter((inv) => {
    const q = query.trim().toLowerCase();
    const matches = !q || inv.invoiceNumber.toLowerCase().includes(q) || clientName(inv.clientId).toLowerCase().includes(q);
    return matches && (statusFilter === "all" || inv.status === statusFilter);
  }), [invoices, query, statusFilter, clients]);

  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "Sent" || i.status === "Overdue").reduce((acc, i) => acc + i.amount, 0);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateInvoice(id, { status: newStatus });
      toast.success(`Invoice marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Invoices & Billing"
        description="Track billable milestones, issue client invoices, and monitor revenue flow"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search invoices…"
              className="h-9 w-48 rounded-lg border border-input bg-background px-3 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Invoice
            </Button>
          </div>
        }
      />

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue (Paid)</p>
            <p className="mt-1 text-2xl font-bold text-success">{formatMoney(totalPaid, "USD")}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-success/12 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        </div>
        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending / Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-warning">{formatMoney(totalPending, "USD")}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-warning/15 text-warning">
            <Clock className="h-5 w-5" />
          </span>
        </div>
        <div className="surface-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Invoices</p>
            <p className="mt-1 text-2xl font-bold">{invoices.length}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/12 text-primary">
            <DollarSign className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Invoice #", "Client", "Project", "Amount", "Status", "Due Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-accent/60">
                <td className="px-4 py-3 font-medium cursor-pointer" onClick={() => setOpenDetail(inv)}>
                  {inv.invoiceNumber}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{clientName(inv.clientId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectName(inv.projectId)}</td>
                <td className="px-4 py-3 font-semibold">{formatMoney(inv.amount, inv.currency)}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold", statusTone[inv.status])}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    <Button variant="ghost" size="icon-xs" title="Delete" onClick={async () => {
                      if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                        await deleteInvoice(inv.id);
                        toast.success("Invoice deleted");
                      }
                    }}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No invoices found. Create your first invoice above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Invoice Dialog */}
      <NewInvoiceDialog
        open={creating}
        onOpenChange={setCreating}
        clients={clients}
        projects={projects}
        onCreate={async (data) => {
          try {
            await addInvoice({
              invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
              client_id: data.clientId || null,
              project_id: data.projectId || null,
              status: "Sent",
              amount: Number(data.amount),
              currency: "USD",
              due_date: new Date(data.dueDate).toISOString(),
              line_items: [{ description: data.description, amount: Number(data.amount) }]
            });
            setCreating(false);
            toast.success("Invoice created successfully!");
          } catch (err) {
            toast.error("Failed to create invoice");
          }
        }}
      />
    </div>
  );
}

function NewInvoiceDialog({ open, onOpenChange, clients, projects, onCreate }: any) {
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [description, setDescription] = useState("Milestone Delivery & Development");
  const [amount, setAmount] = useState(2500);
  const [dueDate, setDueDate] = useState("2026-08-30");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Create New Invoice</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Client</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Project</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description / Line Item</label>
            <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount ($ USD)</label>
              <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
              <input type="date" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!amount} onClick={() => onCreate({ clientId, projectId, description, amount, dueDate })}>Issue Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}