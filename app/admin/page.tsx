'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  Check, 
  X, 
  FileText, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Loader2, 
  RefreshCw, 
  Search, 
  AlertCircle,
} from 'lucide-react';
import HeaderUserNav from '@/components/HeaderUserNav';
import { CreateKarLogo } from '@/components/Logo';
import type { Profile, ContractWithDetails, AdminMetrics } from '@/types/database';

type AdminTab = 'verifications' | 'deals';
type DealFilter = 'All' | 'Proposed' | 'Accepted' | 'In Review' | 'Completed';

export default function AdminOperationsPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('verifications');

  // Data states
  const [creators, setCreators] = useState<Profile[]>([]);
  const [deals, setDeals] = useState<ContractWithDetails[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalVolume: 0,
    totalPlatformRevenue: 0,
    activeDealsCount: 0,
    completedDealsCount: 0,
    verifiedCreatorsCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Per-item mutation states
  const [mutatingCreatorId, setMutatingCreatorId] = useState<string | null>(null);

  // Filters for commercial deals tab
  const [dealStatusFilter, setDealStatusFilter] = useState<DealFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [creatorsRes, dealsRes] = await Promise.all([
        fetch('/api/admin/creators'),
        fetch('/api/admin/deals'),
      ]);

      const creatorsData = await creatorsRes.json();
      const dealsData = await dealsRes.json();

      if (!creatorsRes.ok) {
        throw new Error(creatorsData?.error?.message || 'Failed to load creator directory.');
      }
      if (!dealsRes.ok) {
        throw new Error(dealsData?.error?.message || 'Failed to load platform deals.');
      }

      setCreators(creatorsData.creators || []);
      setDeals(dealsData.deals || []);
      if (dealsData.metrics) {
        setMetrics(dealsData.metrics);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving admin operations data.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Handle verification status toggle
  const handleToggleVerification = async (creator: Profile, nextStatus: boolean) => {
    setMutatingCreatorId(creator.id);
    const actionLabel = nextStatus
      ? `Approving ${creator.display_name}...`
      : `Revoking verification for ${creator.display_name}...`;
    const toastId = toast.loading(actionLabel);

    try {
      const response = await fetch(`/api/admin/creators/${creator.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to update verification status.');
      }

      toast.success(
        nextStatus
          ? `${creator.display_name} is now a verified creator.`
          : `Verification revoked for ${creator.display_name}.`,
        { id: toastId }
      );

      // Update state locally
      setCreators((prev) =>
        prev.map((c) => (c.id === creator.id ? { ...c, is_verified: nextStatus } : c))
      );
      setMetrics((prev) => ({
        ...prev,
        verifiedCreatorsCount: (prev.verifiedCreatorsCount || 0) + (nextStatus ? 1 : -1),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating creator status.';
      toast.error(msg, { id: toastId });
    } finally {
      setMutatingCreatorId(null);
    }
  };

  // Filtered commercial deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      let matchesStatus = true;
      if (dealStatusFilter === 'Proposed') matchesStatus = deal.status === 'PROPOSED';
      if (dealStatusFilter === 'Accepted') matchesStatus = deal.status === 'ACCEPTED';
      if (dealStatusFilter === 'In Review') matchesStatus = deal.status === 'IN_REVIEW';
      if (dealStatusFilter === 'Completed') matchesStatus = deal.status === 'COMPLETED';

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        deal.title.toLowerCase().includes(q) ||
        deal.creator_name.toLowerCase().includes(q) ||
        deal.creator_handle.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [deals, dealStatusFilter, searchQuery]);

  return (
    <main className="min-h-screen bg-paper text-ink py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation */}
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
            <Link href="/admin" className="text-ink font-bold border-b border-ink pb-0.5">
              Admin Desk
            </Link>
            <Link href="/settings" className="text-ink-muted hover:text-ink transition">
              Settings
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink bg-white border border-ledger hover:border-ink rounded-md transition disabled:opacity-50"
            title="Refresh Desk"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <HeaderUserNav />
        </div>
      </nav>

      {/* Header section */}
      <header className="mb-8 text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-seal-light border border-seal/30 text-seal text-[11px] font-mono uppercase tracking-widest font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Platform Operations Desk • Sovereign Ledger Governance</span>
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-ink">
          Operations & Commercial Governance
        </h1>
        <p className="mt-1 text-ink-muted text-sm max-w-2xl font-sans">
          Audit creator identity credentials, inspect platform contract gross settlement volume, and monitor automated GST invoice records.
        </p>
      </header>

      {/* 4 Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Total Volume */}
        <div className="bg-white border border-ledger rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-2 font-mono text-[10px] uppercase tracking-wider">
            <span>Gross Contract Volume</span>
            <TrendingUp className="w-4 h-4 text-seal" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink tracking-tight">
            ₹{metrics.totalVolume.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] font-mono text-ink-muted mt-1">Total commercial contract values</p>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white border border-ledger rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-2 font-mono text-[10px] uppercase tracking-wider">
            <span>Treasury Revenue</span>
            <CreditCard className="w-4 h-4 text-pine" />
          </div>
          <div className="text-2xl font-bold font-mono text-pine tracking-tight">
            ₹{metrics.totalPlatformRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] font-mono text-ink-muted mt-1">₹499 statutory fee per completed brief</p>
        </div>

        {/* Active Deals */}
        <div className="bg-white border border-ledger rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-2 font-mono text-[10px] uppercase tracking-wider">
            <span>Active Contracts</span>
            <FileText className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink tracking-tight">
            {metrics.activeDealsCount}
          </div>
          <p className="text-[11px] font-mono text-ink-muted mt-1">In proposal, active, or audit stages</p>
        </div>

        {/* Verified Creators */}
        <div className="bg-white border border-ledger rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-muted mb-2 font-mono text-[10px] uppercase tracking-wider">
            <span>Verified Registry</span>
            <Users className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="text-2xl font-bold font-mono text-ink tracking-tight">
            {metrics.verifiedCreatorsCount ?? creators.filter((c) => c.is_verified).length}
          </div>
          <p className="text-[11px] font-mono text-ink-muted mt-1">Accredited creators in registry</p>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <div className="border-b border-ledger mb-6 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 text-xs font-mono uppercase tracking-wider transition border-b-2 ${
            activeTab === 'verifications'
              ? 'border-ink text-ink font-bold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Creator Verifications ({creators.length})
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          className={`pb-3 text-xs font-mono uppercase tracking-wider transition border-b-2 ${
            activeTab === 'deals'
              ? 'border-ink text-ink font-bold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Commercial Deals ({deals.length})
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && creators.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-seal animate-spin mb-4" />
          <p className="text-ink-muted text-xs font-mono uppercase tracking-wider">Accessing governance records...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-seal-light border border-seal/30 rounded-md text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-seal mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-ink">Query Exception</h3>
          <p className="text-xs font-mono text-ink-muted mt-1 mb-5">{errorMessage}</p>
          <button
            onClick={loadAdminData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-black text-paper rounded-md text-xs font-mono uppercase tracking-wider transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Query
          </button>
        </div>
      ) : activeTab === 'verifications' ? (
        /* TAB 1: CREATOR VERIFICATIONS */
        <div className="bg-white border border-ledger rounded-md overflow-hidden shadow-sm">
          <div className="p-4 border-b border-ledger flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-ink">
              Creator Identity & Verification Registry
            </h2>
            <span className="text-[11px] font-mono text-ink-muted">
              Only verified creators appear in the public discovery registry
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-ledger text-[10px] uppercase tracking-wider text-ink-muted bg-paper">
                  <th className="py-3 px-4 font-bold">Creator</th>
                  <th className="py-3 px-4 font-bold">Niche</th>
                  <th className="py-3 px-4 font-bold">PAN Number</th>
                  <th className="py-3 px-4 font-bold">UPI ID</th>
                  <th className="py-3 px-4 font-bold text-right">Base Rate</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ledger">
                {creators.map((creator) => {
                  const isMutating = mutatingCreatorId === creator.id;
                  const isVerified = Boolean(creator.is_verified);

                  return (
                    <tr key={creator.id} className="hover:bg-paper/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-ink font-sans text-sm">{creator.display_name}</div>
                        <div className="text-[11px] text-ink-muted">@{creator.handle.replace(/^@/, '')}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold bg-paper text-ink border border-ledger">
                          {creator.niche || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink-muted">
                        {creator.pan_number || '—'}
                      </td>
                      <td className="py-3 px-4 text-ink-muted">
                        {creator.upi_id || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-ink">
                        ₹{Number(creator.starting_rate || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-pine-light text-pine border border-pine/30">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-seal-light text-seal border border-seal/30">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isVerified ? (
                          <button
                            onClick={() => handleToggleVerification(creator, false)}
                            disabled={isMutating}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider font-bold text-ink-muted hover:text-seal border border-ledger hover:border-seal rounded-md transition disabled:opacity-50"
                          >
                            {isMutating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            <span>Revoke</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleVerification(creator, true)}
                            disabled={isMutating}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider font-bold text-white bg-pine hover:bg-pine/90 rounded-md transition disabled:opacity-50 shadow-sm"
                          >
                            {isMutating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            <span>Accredit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: COMMERCIAL DEALS */
        <div className="bg-white border border-ledger rounded-md overflow-hidden shadow-sm">
          {/* Controls: search and status filter pills */}
          <div className="p-4 border-b border-ledger flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['All', 'Proposed', 'Accepted', 'In Review', 'Completed'] as const).map((filter) => {
                const isActive = dealStatusFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setDealStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition ${
                      isActive
                        ? 'bg-ink text-paper border border-ink font-bold shadow-sm'
                        : 'bg-white text-ink-muted border border-ledger hover:text-ink hover:border-ink'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals or creators..."
                className="w-full pl-9 pr-3 py-1.5 bg-paper border border-ledger rounded-md text-xs font-mono text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-ledger text-[10px] uppercase tracking-wider text-ink-muted bg-paper">
                  <th className="py-3 px-4 font-bold">Deal Title</th>
                  <th className="py-3 px-4 font-bold">Creator</th>
                  <th className="py-3 px-4 font-bold text-right">Deal Value</th>
                  <th className="py-3 px-4 font-bold text-right">Platform Fee</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Invoice</th>
                  <th className="py-3 px-4 font-bold text-right">Recorded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ledger">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-muted text-xs">
                      No commercial records matching specified query.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => {
                    const formattedDate = new Date(deal.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr key={deal.id} className="hover:bg-paper/60 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-ink font-sans text-sm">{deal.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-ink font-medium">{deal.creator_name}</div>
                          <div className="text-[11px] text-ink-muted">@{deal.creator_handle.replace(/^@/, '')}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-ink">
                          ₹{Number(deal.total_amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right text-ink-muted">
                          ₹{Number(deal.platform_fee).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {deal.status === 'PROPOSED' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-paper text-ink border border-ledger">
                              Proposed
                            </span>
                          )}
                          {deal.status === 'ACCEPTED' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-pine-light text-pine border border-pine/30">
                              Accepted
                            </span>
                          )}
                          {deal.status === 'IN_REVIEW' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-paper text-ink border border-ink">
                              In Review
                            </span>
                          )}
                          {deal.status === 'COMPLETED' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-pine-light text-pine border border-pine/30">
                              Completed
                            </span>
                          )}
                          {deal.status === 'DECLINED' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-paper text-ink-muted border border-ledger">
                              Declined
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {deal.status === 'COMPLETED' ? (
                            <Link
                              href={`/invoices/${deal.id}`}
                              className="inline-flex items-center gap-1 text-[11px] text-seal hover:underline font-bold"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{deal.invoice_number || 'View Invoice'}</span>
                            </Link>
                          ) : (
                            <span className="text-xs text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-[11px] text-ink-muted">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
