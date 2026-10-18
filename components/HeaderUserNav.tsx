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
        <div className="w-24 h-8 bg-dark-surface animate-pulse rounded-xl border border-dark-border" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Link
          href="/login"
          className="px-3.5 py-1.5 font-medium text-slate-300 hover:text-white bg-dark-surface border border-dark-border hover:border-slate-600 rounded-xl transition duration-150"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-3.5 py-1.5 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition duration-150 shadow-md shadow-indigo-950/50"
        >
          Get Started
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
      ? 'bg-indigo-950/80 border border-indigo-500/40 text-indigo-300'
      : user.role === 'agency'
      ? 'bg-violet-950/80 border border-violet-500/40 text-violet-300'
      : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300';

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
      {/* User Info & Role Badge */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-surface border border-dark-border">
        <User className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-medium text-slate-200 max-w-[130px] truncate">
          {user.display_name}
        </span>
        <span
          className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full uppercase tracking-wider ${roleBadgeStyle}`}
        >
          {roleLabel}
        </span>
      </div>

      {/* Quick link to Profile Settings */}
      <Link
        href="/settings"
        title="Account & Tax Settings"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-slate-300 hover:text-white bg-dark-surface border border-dark-border hover:border-slate-600 rounded-xl transition duration-150"
      >
        <Settings className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Settings</span>
      </Link>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        title="Sign Out"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-medium text-slate-400 hover:text-red-400 bg-dark-surface border border-dark-border hover:border-red-900/50 rounded-xl transition duration-150 disabled:opacity-50"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  );
}
