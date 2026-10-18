'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { CreateKarLogo } from '@/components/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const toastId = toast.loading('Authenticating session...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.error || 'Invalid email or password';
        setErrorMessage(errorMsg);
        toast.error(errorMsg, { id: toastId });
        return;
      }

      toast.success('Session authenticated', { id: toastId });

      const userRole = data?.role;

      // Determine destination
      let targetPath = '/dashboard';
      if (userRole === 'agency') {
        targetPath = '/agency/dashboard';
      } else if (userRole === 'admin') {
        targetPath = '/admin';
      }

      // If redirect param exists and user has appropriate permissions
      if (redirectParam && redirectParam.startsWith('/')) {
        if (redirectParam.startsWith('/admin') && userRole === 'admin') {
          targetPath = redirectParam;
        } else if (redirectParam.startsWith('/agency') && (userRole === 'agency' || userRole === 'admin')) {
          targetPath = redirectParam;
        } else if (redirectParam.startsWith('/dashboard') && (userRole === 'creator' || userRole === 'admin')) {
          targetPath = redirectParam;
        }
      }

      router.push(targetPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during sign in.';
      setErrorMessage(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand Navigation */}
      <div className="mb-8">
        <CreateKarLogo size="lg" href="/" />
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full bg-white border border-ledger rounded-md p-8 sm:p-10 shadow-sm">
        <header className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-seal-light border border-seal/30 text-seal text-[10px] font-mono uppercase tracking-widest font-semibold mb-2.5">
            <ShieldCheck className="w-3 h-3" />
            <span>Cryptographic Session Gate</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-ink">
            Access Ledger Desk
          </h1>
          <p className="text-sm text-ink-muted mt-1 font-sans">
            Authenticate to inspect deals, manage deliverables, or dispatch payouts.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-md bg-seal-light border border-seal/30 text-seal text-xs font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              Electronic Mail (Work Email)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoFocus
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="representative@firm.com"
                className="w-full pl-10 pr-4 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none font-mono transition disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              Secret Passkey
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none font-mono transition disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-ink hover:bg-black text-paper text-xs font-mono uppercase tracking-wider font-bold rounded-md transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-seal" />
                <span>Verifying Signatures...</span>
              </>
            ) : (
              <>
                <span>Authenticate Desk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-ledger text-center text-xs font-mono text-ink-muted">
          <span>Unregistered entity? </span>
          <Link href="/signup" className="text-seal hover:underline font-bold">
            Execute Registration Protocol
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-paper text-ink flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-seal animate-spin" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
