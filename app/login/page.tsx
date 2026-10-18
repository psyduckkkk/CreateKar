'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
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
    const toastId = toast.loading('Signing in...');

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

      toast.success('Successfully logged in!', { id: toastId });

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
    <main className="min-h-screen bg-dark text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Navigation */}
      <div className="mb-8 relative z-10">
        <CreateKarLogo size="lg" href="/" />
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full bg-dark-surface border border-dark-border rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10">
        <header className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Secure Access Gate</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            Log in to CreateKar
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Access your creator deals, brand campaigns, or operations desk.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                className="w-full pl-10 pr-4 py-2.5 bg-dark border border-dark-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                className="w-full pl-10 pr-4 py-2.5 bg-dark border border-dark-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-950/60 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dark-border text-center text-xs text-slate-400">
          <span>Don&apos;t have an account? </span>
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Create an Account
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
        <main className="min-h-screen bg-dark text-slate-100 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
