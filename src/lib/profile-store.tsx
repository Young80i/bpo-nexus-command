import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/lib/persist";

export type Profile = {
  displayName: string;
  email: string;
  company: string;
  phone: string;
  jobTitle: string;
  timeZone: string;
  language: string;
  avatarUrl: string | null;
  createdAt: string;
  notifications: {
    deadlines: boolean;
    messages: boolean;
    milestones: boolean;
    weeklyDigest: boolean;
  };
  preferences: {
    compactMode: boolean;
    autosave: boolean;
    aiSuggestions: boolean;
    defaultCurrency: "USD" | "EUR" | "GBP" | "AUD";
  };
};

export const defaultProfile: Profile = {
  displayName: "Rana S.",
  email: "owner@bponexus.io",
  company: "BPO Nexus",
  phone: "+1 (415) 555-0142",
  jobTitle: "Founder & Delivery Lead",
  timeZone: "Australia/Sydney",
  language: "English (UK)",
  avatarUrl: null,
  createdAt: "2025-11-04",
  notifications: { deadlines: true, messages: true, milestones: true, weeklyDigest: false },
  preferences: { compactMode: false, autosave: true, aiSuggestions: true, defaultCurrency: "USD" },
};

type Ctx = {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
  initials: string;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = usePersistentState<Profile>("profile", defaultProfile);

  const value = useMemo<Ctx>(() => {
    const initials =
      profile.displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || "BN";
    return {
      profile,
      initials,
      update: (patch) => setProfile((prev) => ({ ...prev, ...patch })),
    };
  }, [profile, setProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
