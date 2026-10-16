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
        <div className="w-20 h-6 bg-slate-800 animate-pulse rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-md shadow-sky-950/40"
        >
          Sign In
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
      ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
      : user.role === 'agency'
      ? 'bg-indigo-950/80 border-indigo-800 text-indigo-400'
      : 'bg-sky-950/80 border-sky-800 text-sky-400';

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
      {/* User Info & Role Badge */}
      <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
        <User className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium text-slate-200 max-w-[130px] truncate">
          {user.display_name}
        </span>
        <span
          className={`px-2 py-0.5 text-[10px] font-semibold border rounded-full uppercase tracking-wider ${roleBadgeStyle}`}
        >
          {roleLabel}
        </span>
      </div>

      {/* Quick link to Profile Settings */}
      <Link
        href="/settings"
        title="Profile Settings"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition"
      >
        <Settings className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Settings</span>
      </Link>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        title="Sign Out"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-red-400 bg-red-950/30 border border-red-900/60 hover:bg-red-900/40 hover:text-red-300 rounded-xl transition disabled:opacity-50"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  );
}
