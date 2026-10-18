'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Settings, LogOut } from 'lucide-react';
import type { AuthUser } from '@/types/database';

export default function HeaderUserNav() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.authenticated && data?.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Unauthenticated or network error
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const toastId = toast.loading('Signing out...');
    try {
      await Promise.allSettled([
        fetch('/api/auth/logout', { method: 'POST' }),
        fetch('/api/admin/auth', { method: 'DELETE' }),
      ]);
      toast.success('Signed out successfully.', { id: toastId });
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Error signing out', { id: toastId });
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-7 bg-ledger/60 animate-pulse rounded-md" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Link
          href="/login"
          className="px-3.5 py-1.5 font-medium text-ink bg-paper border border-ledger hover:border-ink rounded-md transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-3.5 py-1.5 font-medium text-paper bg-ink hover:bg-black rounded-md transition-colors"
        >
          Open Account
        </Link>
      </div>
    );
  }

  const roleLabel =
    user.role === 'admin'
      ? 'Staff Admin'
      : user.role === 'agency'
      ? 'Agency'
      : 'Creator';

  const roleBadgeStyle =
    user.role === 'admin'
      ? 'bg-seal-light border border-seal/30 text-seal'
      : user.role === 'agency'
      ? 'bg-pine-light border border-pine/30 text-pine'
      : 'bg-paper border border-ledger text-ink-muted';

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
      {/* User Info & Role Badge */}
      <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-ledger">
        <User className="w-3.5 h-3.5 text-ink-muted" />
        <span className="font-medium text-ink max-w-[130px] truncate">
          {user.display_name}
        </span>
        <span
          className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-sm uppercase tracking-wider ${roleBadgeStyle}`}
        >
          {roleLabel}
        </span>
      </div>

      {/* Quick link to Profile Settings */}
      <Link
        href="/settings"
        title="Account & Tax Settings"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-ink bg-white border border-ledger hover:border-ink rounded-md transition-colors"
      >
        <Settings className="w-3.5 h-3.5 text-ink-muted" />
        <span className="hidden sm:inline">Settings</span>
      </Link>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        title="Sign Out"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-medium text-ink-muted bg-white border border-ledger hover:text-seal hover:border-seal/40 rounded-md transition-colors disabled:opacity-50"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  );
}
