'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Key, Loader2 } from 'lucide-react';
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
    <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-4">
      {/* Brand Navigation */}
      <div className="mb-8">
        <CreateKarLogo size="lg" href="/" />
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full bg-white border border-ledger rounded-md p-8 sm:p-10 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-seal-light border border-seal/30 text-seal text-[10px] font-mono uppercase tracking-widest font-semibold mb-3">
          <ShieldCheck className="w-3 h-3" />
          <span>Operations Governance Gate</span>
        </div>

        <h1 className="text-2xl font-bold font-display tracking-tight text-ink mb-1">
          CreateKar Operations Access
        </h1>
        <p className="text-sm font-sans text-ink-muted mb-6">
          Supply administrative secret key to unlock governance desk and verify creator credentials.
        </p>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-md bg-seal-light border border-seal/30 text-seal text-xs font-mono flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-seal flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              Secret Passkey
            </label>
            <div
              className={`relative transition-transform duration-100 ${
                isShaking ? '-translate-x-1.5 translate-x-1.5' : ''
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
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
                className={`w-full pl-10 pr-4 py-2.5 bg-paper border rounded-md text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none font-mono transition ${
                  errorMessage || isShaking
                    ? 'border-seal ring-1 ring-seal'
                    : 'border-ledger focus:border-ink'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-ink hover:bg-black text-paper text-xs font-mono uppercase tracking-wider font-bold rounded-md shadow-sm transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-seal" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>Unlock Operations Desk</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] font-mono text-ink-muted">
          Restricted administrative jurisdiction. Authorized personnel only.
        </p>
      </div>
    </main>
  );
}
