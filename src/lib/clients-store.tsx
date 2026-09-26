import { createContext, useContext, useMemo, type ReactNode } from "react";
import { clients as seedClients, type Client } from "@/data/demo";
import { usePersistentState, uid } from "@/lib/persist";
import { useSupabaseClients } from "@/lib/supabase/hooks/useSupabaseClients";
import { toast } from "sonner";

export type ClientDraft = Omit<Client, "id">;

type Ctx = {
  clients: Client[];
  get: (id: string) => Client | undefined;
  create: (c: ClientDraft) => Promise<Client>;
  update: (id: string, patch: Partial<Client>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  isDuplicate: (email: string, username: string, ignoreId?: string) => boolean;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

const ClientsContext = createContext<Ctx | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  // Use Supabase hook for data management
  const { clients, loading, error, createClient, updateClient, deleteClient, isDuplicate, refresh } = useSupabaseClients();

  const value = useMemo<Ctx>(() => {
    return {
      clients,
      get: (id) => clients.find((c) => c.id === id),
      isDuplicate,
      create: async (draft) => {
        try {
          const created = await createClient(draft);
          toast.success("Client created");
        return created as unknown as Client;
        } catch (err) {
          toast.error("Failed to create client: " + (err instanceof Error ? err.message : "Unknown error"));
          throw err;
        }
      },
      update: async (id, patch) => {
        try {
          await updateClient(id, patch);
          toast.success("Client updated");
        } catch (err) {
          toast.error("Failed to update client: " + (err instanceof Error ? err.message : "Unknown error"));
          throw err;
        }
      },
      remove: async (id) => {
        try {
          await deleteClient(id);
          toast.success("Client deleted");
        } catch (err) {
          toast.error("Failed to delete client: " + (err instanceof Error ? err.message : "Unknown error"));
          throw err;
        }
      },
      loading,
      error,
      refresh
    };
  }, [clients, loading, error, createClient, updateClient, deleteClient, isDuplicate, refresh]);

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error("useClients must be used inside ClientsProvider");
  return ctx;
}

export const emptyClient: ClientDraft = {
  name: "",
  country: "United States",
  countryCode: "US",
  freelancerUsername: "",
  email: "",
  phone: "",
  company: "",
  totalProjects: 0,
  totalRevenue: 0,
  rating: 5,
  notes: "",
  attachments: [],
  since: new Date().toISOString().slice(0, 10),
  status: "Prospect",
};

