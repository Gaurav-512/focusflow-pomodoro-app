
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  if (!mounted) {
    return (
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            FocusFlow
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10"></div> {/* Placeholder for button */}
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          FocusFlow
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/" passHref>
            <Button variant={isActive('/') ? 'default' : 'ghost'} size="sm" aria-label="Timer Page">
              <Home className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Timer</span>
            </Button>
          </Link>
          <Link href="/settings" passHref>
            <Button variant={isActive('/settings') ? 'default' : 'ghost'} size="sm" aria-label="Settings Page">
              <Settings className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </nav>
    </header>
  );
}
