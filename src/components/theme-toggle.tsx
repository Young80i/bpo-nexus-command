import React from 'react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      type="button"
    >
      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}