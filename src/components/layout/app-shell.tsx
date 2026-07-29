import { useState, type ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar open={open} />
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setOpen((o) => !o)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyPage({ title, description, note }: { title: string; description: string; note: string }) {
  return (
    <div className="animate-fade-in">
      <PageHeader title={title} description={description} />
      <div className="surface-card grid min-h-[420px] place-items-center p-10 text-center">
        <div className="max-w-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-primary-foreground">
            <span className="text-lg font-bold">{title.charAt(0)}</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold">{title} workspace</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note}</p>
        </div>
      </div>
    </div>
  );
}
