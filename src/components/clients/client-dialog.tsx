import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isValidEmail, normalizeEmail } from "@/lib/utils";
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return toast.error("Contact name is required");
    if (!draft.company.trim()) return toast.error("Company is required");
    if (!isValidEmail(draft.email)) return toast.error("Enter a valid email address");

    // Normalize email for submission
    const normalizedEmail = normalizeEmail(draft.email);
    if (isDuplicate(normalizedEmail, draft.freelancerUsername, client?.id))
      return toast.error("A client with that email or Freelancer username already exists");

    if (client) {
      const submissionDraft = { ...draft, email: normalizedEmail };
      update(client.id, submissionDraft);
      toast.success("Client updated");
      onSaved?.({ ...client, ...submissionDraft });
    } else {
      const submissionDraft = { ...draft, email: normalizedEmail };
      const created = create(submissionDraft);
      toast.success("Client created");
      onSaved?.(created);
    }
    onClose();
  };
  // ... existing code ...
}

