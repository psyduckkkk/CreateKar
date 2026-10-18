'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Building, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
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
    const toastId = toast.loading('Registering entity to ledger...');

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
          niche: niche.trim() || (role === 'creator' ? 'General Commercial' : 'Brand Studio'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.error || 'Registration failed.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg, { id: toastId });
        return;
      }

      toast.success('Registration completed', { id: toastId });

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
    <main className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-4 sm:p-6 py-12">
      {/* Brand Navigation */}
      <div className="mb-8">
        <CreateKarLogo size="lg" href="/" />
      </div>

      {/* Signup Card */}
      <div className="max-w-lg w-full bg-white border border-ledger rounded-md p-8 sm:p-10 shadow-sm">
        <header className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-seal-light border border-seal/30 text-seal text-[10px] font-mono uppercase tracking-widest font-semibold mb-2.5">
            <ShieldCheck className="w-3 h-3" />
            <span>Commercial Registration Protocol</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-ink">
            Register Party on Ledger
          </h1>
          <p className="text-sm text-ink-muted mt-1 font-sans">
            Enroll as an independent creator or contracting agency under the standard commercial agreement.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-md bg-seal-light border border-seal/30 text-seal text-xs font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-2">
              Select Legal Party Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`p-3.5 rounded-md border text-left transition flex flex-col gap-1 ${
                  role === 'creator'
                    ? 'border-ink bg-paper text-ink ring-1 ring-ink'
                    : 'border-ledger bg-white text-ink-muted hover:border-ink/60 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider">
                  <User className={`w-3.5 h-3.5 ${role === 'creator' ? 'text-seal' : 'text-ink-muted'}`} />
                  <span>Independent Creator</span>
                </div>
                <span className="text-[11px] text-ink-muted leading-snug font-sans">
                  Execute brand briefs & receive direct UPI settlements
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('agency')}
                className={`p-3.5 rounded-md border text-left transition flex flex-col gap-1 ${
                  role === 'agency'
                    ? 'border-ink bg-paper text-ink ring-1 ring-ink'
                    : 'border-ledger bg-white text-ink-muted hover:border-ink/60 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider">
                  <Building className={`w-3.5 h-3.5 ${role === 'agency' ? 'text-seal' : 'text-ink-muted'}`} />
                  <span>Contracting Agency</span>
                </div>
                <span className="text-[11px] text-ink-muted leading-snug font-sans">
                  Commission creators & issue legally binding briefs
                </span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              {role === 'creator' ? 'Full Legal Name' : 'Company / Entity Registered Name'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                {role === 'creator' ? <User className="w-4 h-4" /> : <Building className="w-4 h-4" />}
              </div>
              <input
                type="text"
                required
                disabled={isLoading}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={role === 'creator' ? 'Priya Menon' : 'Acme Media Pvt Ltd'}
                className="w-full pl-10 pr-4 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none font-mono transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Public Handle */}
          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              Identifier Handle
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted font-mono text-xs">
                @
              </div>
              <input
                type="text"
                required
                disabled={isLoading}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={role === 'creator' ? 'priyastyle' : 'acmemedia'}
                className="w-full pl-8 pr-4 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none font-mono transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              Official Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none font-mono transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Niche or Focus Area */}
          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              {role === 'creator' ? 'Primary Commercial Sector' : 'Industry Focus'}
            </label>
            <input
              type="text"
              disabled={isLoading}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={role === 'creator' ? 'Tech, Fashion, Fitness, Lifestyle' : 'D2C Consumer, Fintech, Enterprise'}
              className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none font-mono transition disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono font-medium text-ink-muted uppercase tracking-wider mb-1.5">
              Passkey (Min 8 Characters)
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none font-mono transition disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !displayName.trim() || !email.trim() || !handle.trim() || password.length < 8}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-ink hover:bg-black text-paper text-xs font-mono uppercase tracking-wider font-bold rounded-md transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-seal" />
                <span>Recording Entity...</span>
              </>
            ) : (
              <>
                <span>Execute Enrollment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-ledger text-center text-xs font-mono text-ink-muted">
          <span>Already registered? </span>
          <Link href="/login" className="text-seal hover:underline font-bold">
            Access Authenticated Desk
          </Link>
        </div>
      </div>
    </main>
  );
}
