'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  User, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  Settings, 
  Loader2 
} from 'lucide-react';
import HeaderUserNav from '@/components/HeaderUserNav';
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
    const toastId = toast.loading('Saving profile changes...');

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
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const isCreator = profile?.role === 'creator';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-sky-500">Create</span>Kar
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link href="/creators" className="text-slate-400 hover:text-white transition">
              Creator Directory
            </Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
              Creator Deals
            </Link>
            <Link href="/agency/dashboard" className="text-slate-400 hover:text-white transition">
              Agency Desk
            </Link>
            <Link href="/settings" className="text-sky-400 font-semibold">
              Settings
            </Link>
          </div>
        </div>

        <HeaderUserNav />
      </nav>

      {/* Page Header */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5" />
          Account & Profile Settings
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Commercial Profile & Tax Credentials
        </h1>
        <p className="mt-1 text-slate-400 text-sm max-w-2xl">
          Configure your public profile, commercial rates, settlement UPI address, and tax information for invoice generation.
        </p>
      </header>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading profile settings...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-red-950/20 border border-red-900/50 rounded-2xl text-center max-w-md mx-auto">
          <p className="text-sm text-red-300 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Identity */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <User className="w-4 h-4 text-sky-400" />
                <span>Identity & Handle</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    {isCreator ? 'Display Name' : 'Company / Agency Name'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Public Handle
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition font-mono text-xs"
                  />
                </div>
              </div>

              {isCreator && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Primary Niche
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {NICHE_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setNiche(opt)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                          niche.toLowerCase() === opt.toLowerCase()
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
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
                    placeholder="Or enter custom niche"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  Bio / Commercial Overview
                </label>
                <textarea
                  rows={3}
                  disabled={isSaving}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your creative specialty, past brand campaigns, or company focus..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Section 2: Creator Commercial Rates & Payouts */}
            {isCreator && (
              <div className="space-y-4 pt-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Commercial Rates & Direct UPI Settlement</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      Starting Deliverable Rate (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
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
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Default baseline budget when brands propose a campaign.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      UPI ID (Payout Address)
                    </label>
                    <input
                      type="text"
                      disabled={isSaving}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okaxis or name@upi"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Direct 0% platform fee payouts are routed here.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Tax Credentials & Invoicing Address */}
            <div className="space-y-4 pt-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Tax Credentials & Invoicing Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    disabled={isSaving}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition font-mono text-xs uppercase"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Required for B2B tax invoice generation and statutory TDS compliance.
                  </p>
                </div>

                {!isCreator && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      disabled={isSaving}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="29AAACK1234F1Z5"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition font-mono text-xs uppercase"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Your registered Goods and Services Tax Identification Number.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    City / District
                  </label>
                  <input
                    type="text"
                    disabled={isSaving}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    State / Region
                  </label>
                  <input
                    type="text"
                    disabled={isSaving}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-sm text-slate-100 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-sky-950/40 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Settings</span>
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
