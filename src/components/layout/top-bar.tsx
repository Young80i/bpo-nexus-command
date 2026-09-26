import * as React from 'react'
import { useState, useCallback } from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu'
import { Moon, Sun, Search, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { useTheme } from '@/lib/theme'

export function TopBar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const handleSignOut = useCallback(async () => {
    await signOut()
  }, [signOut])

  const UserProfile = () => {
    if (!user) return null
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
      </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className="flex h-14 items-center justify-between px-4 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex items-center space-x-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">Logo</span>
        </div>

        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded hover:bg-accent/20"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>
          {isSearchOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-md bg-popover p-2 shadow-lg border border-input z-50">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent px-2 py-1 text-sm outline-none"
              />
            </div>
          )}
      </div>
        </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Profile */}
        <UserProfile />
      </div>
    </header>
  )
}

