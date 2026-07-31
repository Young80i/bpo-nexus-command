import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultAutomations, type AutomationKey } from "@/lib/automation";

const STORAGE_KEY = "bpo-automations";

type Ctx = {
  enabled: Record<AutomationKey, boolean>;
  isOn: (key: AutomationKey) => boolean;
  toggle: (key: AutomationKey) => void;
  setAll: (value: boolean) => void;
};

const AutomationContext = createContext<Ctx | null>(null);

export function AutomationProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<Record<AutomationKey, boolean>>(defaultAutomations);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setEnabled({ ...defaultAutomations, ...(JSON.parse(raw) as Record<AutomationKey, boolean>) });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const persist = useCallback((next: Record<AutomationKey, boolean>) => {
    setEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      enabled,
      isOn: (key) => enabled[key] ?? true,
      toggle: (key) => persist({ ...enabled, [key]: !(enabled[key] ?? true) }),
      setAll: (value) =>
        persist(
          Object.fromEntries(Object.keys(enabled).map((k) => [k, value])) as Record<AutomationKey, boolean>,
        ),
    }),
    [enabled, persist],
  );

  return <AutomationContext.Provider value={value}>{children}</AutomationContext.Provider>;
}

export function useAutomation() {
  const ctx = useContext(AutomationContext);
  if (!ctx) throw new Error("useAutomation must be used inside AutomationProvider");
  return ctx;
}
