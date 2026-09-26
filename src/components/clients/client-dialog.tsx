import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { emptyClient, useClients, type ClientDraft } from "@/lib/clients-store";
import type { Client } from "@/data/demo";

const field = "mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground";
const label = "block text-xs font-medium text-muted-foreground";

export function ClientDialog({
  client,
  onClose,
  onSaved,
}: {
  client?: Client;
  onClose: () => void;
  onSaved?: (c: Client) => void;
}) {
  const { create, update, isDuplicate } = useClients();
  const [draft, setDraft] = useState<ClientDraft>(client ? { ...client } : { ...emptyClient });
  const set = <K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return toast.error("Contact name is required");
    if (!draft.company.trim()) return toast.error("Company is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) return toast.error("Enter a valid email address");
    if (isDuplicate(draft.email, draft.freelancerUsername, client?.id))
      return toast.error("A client with that email or Freelancer username already exists");

    if (client) {
      try { await update(client.id, draft); } catch { return; }
      onSaved?.({ ...client, ...draft });
    } else {
      let created: Client;
      try { created = await create(draft); } catch { return; }
      onSaved?.(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6"
      >
        <h2 className="font-display text-lg font-bold">{client ? "Edit client" : "Add client"}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Every field can be edited later from the client profile.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Contact name
            <input className={field} value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className={label}>
            Company
            <input className={field} value={draft.company} onChange={(e) => set("company", e.target.value)} />
          </label>
          <label className={label}>
            Email
            <input type="email" className={field} value={draft.email} onChange={(e) => set("email", e.target.value)} />
          </label>
          <label className={label}>
            Phone
            <input className={field} value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
          </label>
          <label className={label}>
            Freelancer username
            <input
              className={field}
              value={draft.freelancerUsername}
              onChange={(e) => set("freelancerUsername", e.target.value)}
            />
          </label>
          <label className={label}>
            Country
            <input className={field} value={draft.country} onChange={(e) => set("country", e.target.value)} />
          </label>
          <label className={label}>
            Country code
            <input
              className={field}
              maxLength={3}
              value={draft.countryCode}
              onChange={(e) => set("countryCode", e.target.value.toUpperCase())}
            />
          </label>
          <label className={label}>
            Status
            <select
              className={field}
              value={draft.status}
              onChange={(e) => set("status", e.target.value as Client["status"])}
            >
              <option value="Active">Active</option>
              <option value="Prospect">Prospect</option>
              <option value="Dormant">Dormant</option>
            </select>
          </label>
          <label className={label}>
            Total projects
            <input
              type="number"
              min={0}
              className={field}
              value={draft.totalProjects}
              onChange={(e) => set("totalProjects", Number(e.target.value))}
            />
          </label>
          <label className={label}>
            Lifetime revenue (USD)
            <input
              type="number"
              min={0}
              className={field}
              value={draft.totalRevenue}
              onChange={(e) => set("totalRevenue", Number(e.target.value))}
            />
          </label>
          <label className={label}>
            Rating
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className={field}
              value={draft.rating}
              onChange={(e) => set("rating", Number(e.target.value))}
            />
          </label>
          <label className={label}>
            Client since
            <input type="date" className={field} value={draft.since} onChange={(e) => set("since", e.target.value)} />
          </label>
        </div>

        <label className={`${label} mt-3 block`}>
          Notes
          <textarea
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            value={draft.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{client ? "Save changes" : "Create client"}</Button>
        </div>
      </form>
    </div>
  );
}
