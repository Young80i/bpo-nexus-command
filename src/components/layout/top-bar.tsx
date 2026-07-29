import { Bell, Menu, Moon, Plus, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Toggle navigation">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden min-w-0 flex-1 md:block md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search projects, clients, milestones…"
          className="h-9 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-16 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Plus className="h-4 w-4" /> New Project
        </Button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-[1.1rem] w-[1.1rem]" /> : <Moon className="h-[1.1rem] w-[1.1rem]" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-[1.1rem] w-[1.1rem]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <div className="ml-1 flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full brand-gradient text-[0.7rem] font-bold text-primary-foreground">
            RS
          </span>
          <span className="hidden text-xs font-semibold sm:block">Rana S.</span>
        </div>
      </div>
    </header>
  );
}
