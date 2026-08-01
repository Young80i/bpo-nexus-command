import { createContext, useContext, useMemo, type ReactNode } from "react";
import { clients as seedClients, type Client } from "@/data/demo";
import { usePersistentState, uid } from "@/lib/persist";

export type ClientDraft = Omit<Client, "id">;

type Ctx = {
  clients: Client[];
  get: (id: string) => Client | undefined;
  create: (c: ClientDraft) => Client;
  update: (id: string, patch: Partial<Client>) => void;
  remove: (id: string) => void;
  isDuplicate: (email: string, username: string, ignoreId?: string) => boolean;
};

const ClientsContext = createContext<Ctx | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = usePersistentState<Client[]>("clients", seedClients);

  const value = useMemo<Ctx>(() => {
    const isDuplicate = (email: string, username: string, ignoreId?: string) =>
      clients.some(
        (c) =>
          c.id !== ignoreId &&
          (c.email.trim().toLowerCase() === email.trim().toLowerCase() ||
            c.freelancerUsername.trim().toLowerCase() === username.trim().toLowerCase()),
      );

    return {
      clients,
      get: (id) => clients.find((c) => c.id === id),
      isDuplicate,
      create: (draft) => {
        const created: Client = { ...draft, id: uid("c") };
        setClients((prev) => [created, ...prev]);
        return created;
      },
      update: (id, patch) =>
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      remove: (id) => setClients((prev) => prev.filter((c) => c.id !== id)),
    };
  }, [clients, setClients]);

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
