'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Building, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { CreateKarLogo } from '@/components/Logo';

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<'creator' | 'agency'>('creator');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [niche, setNiche] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim() || !email.trim() || !handle.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const toastId = toast.loading('Creating your account...');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          display_name: displayName.trim(),
          email: email.trim(),
          handle: handle.trim(),
          password,
          niche: niche.trim() || (role === 'creator' ? 'Tech' : 'Brand Studio'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.error || 'Registration failed.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg, { id: toastId });
        return;
      }

      toast.success('Account created successfully!', { id: toastId });

      // Route to appropriate dashboard
      const targetPath = role === 'creator' ? '/dashboard' : '/agency/dashboard';
      router.push(targetPath);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
      setErrorMessage(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 py-12 relative selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Brand Navigation */}
      <div className="mb-8 relative z-10">
        <CreateKarLogo size="lg" href="/" />
      </div>

      {/* Signup Card */}
      <div className="max-w-lg w-full bg-dark-surface border border-dark-border rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10">
        <header className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Join Verified Dealflow</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Start collaborating on verified creator brand campaigns with 0% commission.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`p-4 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  role === 'creator'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/30'
                    : 'border-dark-border bg-dark text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <User className={`w-4 h-4 ${role === 'creator' ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>Creator</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-snug font-sans">
                  Execute brand briefs & receive direct UPI payouts
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('agency')}
                className={`p-4 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  role === 'agency'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/30'
                    : 'border-dark-border bg-dark text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Building className={`w-4 h-4 ${role === 'agency' ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>Brand / Agency</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-snug font-sans">
                  Hire verified creators & issue legally binding briefs
                </span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {role === 'creator' ? 'Full Legal Name' : 'Company / Agency Name'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                {role === 'creator' ? <User className="w-4 h-4" /> : <Building className="w-4 h-4" />}
              </div>
              <input
                type="text"
                required
                disabled={isLoading}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={role === 'creator' ? 'Priya Menon' : 'Acme Media Pvt Ltd'}
                className="w-full pl-10 pr-4 py-2.5 bg-dark border border-dark-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Public Handle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Public Handle
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                @
              </div>
              <input
                type="text"
                required
                disabled={isLoading}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={role === 'creator' ? 'priyastyle' : 'acmemedia'}
                className="w-full pl-8 pr-4 py-2.5 bg-dark border border-dark-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Address */}
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
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="representative@firm.com"
                className="w-full pl-10 pr-4 py-2.5 bg-dark border border-dark-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Niche or Focus Area */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {role === 'creator' ? 'Primary Niche' : 'Industry Focus'}
            </label>
            <input
              type="text"
              disabled={isLoading}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={role === 'creator' ? 'Tech, Fashion, Fitness, Lifestyle' : 'D2C Consumer, Fintech, SaaS'}
              className="w-full px-3.5 py-2.5 bg-dark border border-dark-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password (Min 8 Characters)
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-dark border border-dark-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !displayName.trim() || !email.trim() || !handle.trim() || password.length < 8}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-950/60 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dark-border text-center text-xs text-slate-400">
          <span>Already registered? </span>
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
