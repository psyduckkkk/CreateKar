'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Key, Loader2, Sparkles } from 'lucide-react';
import { CreateKarLogo } from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setErrorMessage('Please enter the operations secret key.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || 'Invalid admin credentials');
        triggerShake();
        toast.error('Access Denied: Invalid operations secret');
        return;
      }

      toast.success('Access Granted: Operations Desk unlocked');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication request failed';
      setErrorMessage(msg);
      triggerShake();
      toast.error('Network error during authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <main className="min-h-screen bg-dark text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Navigation */}
      <div className="mb-8 relative z-10">
        <CreateKarLogo size="lg" href="/" />
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full bg-dark-surface border border-dark-border rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Operations Security Gate</span>
        </div>

        <h1 className="text-2xl font-bold font-display tracking-tight text-white mb-2">
          CreateKar Operations Access
        </h1>
        <p className="text-sm font-sans text-slate-400 mb-6">
          Enter the administrative secret key to unlock the platform governance desk and manage creator verifications.
        </p>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Secret Passkey
            </label>
            <div
              className={`relative transition-transform duration-100 ${
                isShaking ? '-translate-x-1.5 translate-x-1.5' : ''
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                autoFocus
                disabled={isSubmitting}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter Operations Secret Key"
                className={`w-full pl-10 pr-4 py-2.5 bg-dark border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                  errorMessage || isShaking
                    ? 'border-red-500 ring-2 ring-red-500/30'
                    : 'border-dark-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-950/60 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Unlock Operations Desk</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Restricted administrative zone. Authorized CreateKar personnel only.
        </p>
      </div>
    </main>
  );
}
