'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  User, 
  CreditCard, 
  FileText, 
  Check, 
  Settings, 
  Loader2,
  ShieldCheck 
} from 'lucide-react';
import HeaderUserNav from '@/components/HeaderUserNav';
import { CreateKarLogo } from '@/components/Logo';
import type { Profile } from '@/types/database';

const NICHE_OPTIONS = ['Tech', 'Fashion', 'Fitness', 'Lifestyle', 'Business', 'Food', 'Travel'];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [niche, setNiche] = useState('');
  const [bio, setBio] = useState('');
  const [startingRate, setStartingRate] = useState<number | string>('');
  const [upiId, setUpiId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error?.message || 'Failed to retrieve profile');
        }

        const p: Profile = data.profile;
        setProfile(p);
        setDisplayName(p.display_name || '');
        setHandle(p.handle || '');
        setNiche(p.niche || 'Tech');
        setBio(p.bio || '');
        setStartingRate(p.starting_rate || '');
        setUpiId(p.upi_id || '');
        setPanNumber(p.pan_number || '');
        setGstin(p.gstin || '');
        setCity(p.city || '');
        setState(p.state || '');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error loading profile settings';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !handle.trim()) {
      toast.error('Display name and handle are required.');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Recording settings changes on ledger...');

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          handle: handle.trim(),
          niche: niche.trim(),
          bio: bio.trim(),
          starting_rate: startingRate ? Number(startingRate) : 0,
          upi_id: upiId.trim(),
          pan_number: panNumber.trim().toUpperCase(),
          gstin: gstin.trim().toUpperCase(),
          city: city.trim(),
          state: state.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || data?.error || 'Failed to update profile.');
      }

      setProfile(data.profile);
      toast.success('Commercial profile updated successfully', { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const isCreator = profile?.role === 'creator';

  return (
    <main className="min-h-screen bg-paper text-ink py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between pb-6 mb-8 border-b border-ledger">
        <div className="flex items-center gap-6">
          <CreateKarLogo size="md" href="/" />
          <div className="hidden sm:flex items-center gap-5 text-xs font-mono uppercase tracking-wider">
            <Link href="/creators" className="text-ink-muted hover:text-ink transition">
              Registry
            </Link>
            <Link href="/dashboard" className="text-ink-muted hover:text-ink transition">
              Creator Desk
            </Link>
            <Link href="/agency/dashboard" className="text-ink-muted hover:text-ink transition">
              Agency Desk
            </Link>
            <Link href="/settings" className="text-ink font-bold border-b border-ink pb-0.5">
              Settings
            </Link>
          </div>
        </div>

        <HeaderUserNav />
      </nav>

      {/* Page Header */}
      <header className="mb-8 text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-seal-light border border-seal/30 text-seal text-[11px] font-mono uppercase tracking-widest font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Entity Profile & Tax Credentials Configuration</span>
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-ink">
          Commercial Profile & Tax Settings
        </h1>
        <p className="mt-1 text-ink-muted text-sm max-w-2xl font-sans">
          Configure registered public identity, baseline tariffs, direct UPI payout routing, and statutory tax credentials for B2B invoice generation.
        </p>
      </header>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-seal animate-spin mb-4" />
          <p className="text-ink-muted text-xs font-mono uppercase tracking-wider">Loading entity configuration...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-seal-light border border-seal/30 rounded-md text-center max-w-md mx-auto">
          <p className="text-xs font-mono text-ink-muted mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-ink hover:bg-black text-paper rounded-md text-xs font-mono uppercase tracking-wider font-bold"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="max-w-3xl bg-white border border-ledger rounded-md p-6 sm:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Identity */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-ink flex items-center gap-2 pb-2 border-b border-ledger">
                <User className="w-4 h-4 text-seal" />
                <span>Identity & Handle Configuration</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                    {isCreator ? 'Full Legal Name' : 'Company / Agency Name'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                    Public Handle
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition"
                  />
                </div>
              </div>

              {isCreator && (
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                    Primary Commercial Sector
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {NICHE_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setNiche(opt)}
                        className={`px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition ${
                          niche.toLowerCase() === opt.toLowerCase()
                            ? 'bg-ink text-paper border border-ink font-bold shadow-sm'
                            : 'bg-paper text-ink-muted border border-ledger hover:text-ink hover:border-ink'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    disabled={isSaving}
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Or specify custom commercial category"
                    className="w-full px-3.5 py-2 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                  Bio / Commercial Overview
                </label>
                <textarea
                  rows={3}
                  disabled={isSaving}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Detail creative specialization, brand partnerships, or agency focus..."
                  className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition"
                />
              </div>
            </div>

            {/* Section 2: Creator Commercial Rates & Payouts */}
            {isCreator && (
              <div className="space-y-4 pt-4">
                <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-ink flex items-center gap-2 pb-2 border-b border-ledger">
                  <CreditCard className="w-4 h-4 text-seal" />
                  <span>Commercial Tariffs & Direct UPI Payout Routing</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                      Base Deliverable Tariff (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-muted font-mono text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        disabled={isSaving}
                        value={startingRate}
                        onChange={(e) => setStartingRate(e.target.value)}
                        placeholder="15000"
                        className="w-full pl-8 pr-4 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition"
                      />
                    </div>
                    <p className="text-[11px] font-mono text-ink-muted mt-1">
                      Baseline rate populated when agencies issue proposals.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                      UPI ID (Payout Address)
                    </label>
                    <input
                      type="text"
                      disabled={isSaving}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okaxis or name@upi"
                      className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition"
                    />
                    <p className="text-[11px] font-mono text-ink-muted mt-1">
                      Direct payouts with 0% platform deductions route here.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Tax Credentials & Invoicing Address */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-ink flex items-center gap-2 pb-2 border-b border-ledger">
                <FileText className="w-4 h-4 text-seal" />
                <span>Statutory Tax Credentials & Registered Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    disabled={isSaving}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition uppercase"
                  />
                  <p className="text-[11px] font-mono text-ink-muted mt-1">
                    Required for B2B tax invoice generation and statutory compliance.
                  </p>
                </div>

                {!isCreator && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      disabled={isSaving}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="29AAACK1234F1Z5"
                      className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition uppercase"
                    />
                    <p className="text-[11px] font-mono text-ink-muted mt-1">
                      Goods and Services Tax Identification Number.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                    City / District
                  </label>
                  <input
                    type="text"
                    disabled={isSaving}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
                    State / Jurisdiction
                  </label>
                  <input
                    type="text"
                    disabled={isSaving}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3.5 py-2.5 bg-paper border border-ledger focus:border-ink rounded-md text-xs font-mono text-ink focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-ledger flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink hover:bg-black text-paper font-mono text-xs uppercase tracking-wider font-bold rounded-md transition shadow-sm disabled:opacity-50 active:scale-[0.99]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-seal" />
                    <span>Committing Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Entity Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
