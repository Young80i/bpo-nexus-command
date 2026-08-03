import { createContext, useContext, useMemo, type ReactNode } from "react";
import { vaultFiles as seedFiles, type FileKind, type VaultFile } from "@/data/files";
import { usePersistentState, uid, today, formatBytes } from "@/lib/persist";
import { useSupabaseFiles } from "@/lib/supabase/hooks/useSupabaseFiles";

const MAX_INLINE_BYTES = 1.5 * 1024 * 1024;

type Ctx = {
  files: VaultFile[];
  add: (f: Omit<VaultFile, "id">) => VaultFile;
  update: (id: string, patch: Partial<VaultFile>) => void;
  remove: (id: string) => void;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

const FilesContext = createContext<Ctx | null>(null);

export function FilesProvider({ children }: { children: ReactNode }) {
  // Use Supabase hook for data management
  const { files, loading, error, addFile, updateFile, deleteFile, refresh } = useSupabaseFiles();

  const value = useMemo<Ctx>(
    () => ({
      files,
      add: (f) => {
        const created = addFile(f);
        return created as unknown as VaultFile;
      },
      update: (id, patch) => {
        updateFile(id, patch).catch(console.error);
      },
      remove: (id) => {
        deleteFile(id).catch(console.error);
      },
      loading,
      error,
      refresh
    }),
    [files, loading, error, addFile, updateFile, deleteFile, refresh],
  );

  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>;
}

export function useFiles() {
  const ctx = useContext(FilesContext);
  if (!ctx) throw new Error("useFiles must be used inside FilesProvider");
  return ctx;
}

const extKinds: Record<string, FileKind> = {
  png: "Image", jpg: "Image", jpeg: "Image", gif: "Image", webp: "Image", svg: "Image", bmp: "Image", avif: "Image",
  mp4: "Video", mov: "Video", webm: "Video", avi: "Video", mkv: "Video",
  mp3: "Audio", wav: "Audio", ogg: "Audio", m4a: "Audio", flac: "Audio",
  pdf: "PDF",
  doc: "Document", docx: "Document", rtf: "Document", odt: "Document", txt: "Document", md: "Document",
  xls: "Spreadsheet", xlsx: "Spreadsheet", csv: "Spreadsheet", ods: "Spreadsheet",
  ppt: "Presentation", pptx: "Presentation", key: "Presentation",
  zip: "ZIP", rar: "ZIP", "7z": "ZIP", tar: "ZIP", gz: "ZIP",
  ts: "Source Code", tsx: "Source Code", js: "Source Code", jsx: "Source Code", py: "Source Code",
  go: "Source Code", rs: "Source Code", java: "Source Code", cs: "Source Code", cpp: "Source Code",
  sql: "Source Code", sh: "Source Code", html: "Source Code", css: "Source Code",
  json: "Data", xml: "Data", yaml: "Data", yml: "Data",
  fbx: "Game Asset", obj: "Game Asset", blend: "Game Asset", unitypackage: "Game Asset",
  glb: "Game Asset", gltf: "Game Asset", uasset: "Game Asset", prefab: "Game Asset",
};

export function detectKind(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return extKinds[ext] ?? "Other";
}

const textKinds: FileKind[] = ["Source Code", "Data"];

/** Reads a browser File into a VaultFile draft, inlining small files for preview/download. */
export async function readUpload(file: File): Promise<Omit<VaultFile, "id" | "clientId" | "projectId" | "milestoneId" | "description">> {
  const kind = detectKind(file.name);
  const base = {
    name: file.name,
    kind,
    size: formatBytes(file.size),
    uploaded: today(),
    uploadedBy: "You",
    mime: file.type || null,
  };

  if (file.size > MAX_INLINE_BYTES) {
    return { ...base, preview: null, dataUrl: null };
  }

  if (textKinds.includes(kind) || file.type.startsWith("text/")) {
    const text = await file.text();
    return { ...base, preview: text.slice(0, 4000), dataUrl: null };
  }

  const dataUrl = await new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  const preview = kind === "Image" ? "image" : kind === "Video" ? "video" : kind === "Audio" ? "audio" : null;
  return { ...base, preview, dataUrl };
}
