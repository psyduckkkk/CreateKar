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
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation */}
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
              Creator Inbox
            </Link>
            <Link href="/agency/dashboard" className="text-slate-400 hover:text-white transition">
              Agency Dashboard
            </Link>
            <Link href="/admin" className="text-sky-400 font-semibold">
              Admin Desk
            </Link>
            <Link href="/settings" className="text-slate-400 hover:text-white transition">
              Settings
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition disabled:opacity-50"
            title="Refresh Desk"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <HeaderUserNav />
        </div>
      </nav>

      {/* Header section */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Platform Operations Desk
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Operations & Commercial Governance
        </h1>
        <p className="mt-1 text-slate-400 text-sm max-w-2xl">
          Review creator identity verifications, inspect platform contract volume, and audit completed B2B settlement invoices.
        </p>
      </header>

      {/* 4 Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Total Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹{metrics.totalVolume.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">Gross commercial contract value</p>
        </div>

        {/* Platform Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ₹{metrics.totalPlatformRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">₹499 flat fee per completed deal</p>
        </div>

        {/* Active Deals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.activeDealsCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">In proposal, active, or review stages</p>
        </div>

        {/* Verified Creators */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Creators</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.verifiedCreatorsCount ?? creators.filter((c) => c.is_verified).length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Approved creators in directory</p>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-800 mb-6 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'verifications'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Creator Verifications ({creators.length})
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'deals'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Commercial Deals ({deals.length})
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && creators.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading operations desk data...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-red-950/20 border border-red-900/50 rounded-2xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">Error Loading Data</h3>
          <p className="text-sm text-slate-400 mt-1 mb-5">{errorMessage}</p>
          <button
            onClick={loadAdminData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : activeTab === 'verifications' ? (
        /* TAB 1: CREATOR VERIFICATIONS */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Creator Identity & Verification Status
            </h2>
            <span className="text-xs text-slate-400">
              Only verified creators appear in the public discovery directory
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 bg-slate-950/40">
                  <th className="py-3.5 px-5 font-semibold">Creator</th>
                  <th className="py-3.5 px-4 font-semibold">Niche</th>
                  <th className="py-3.5 px-4 font-semibold">PAN Number</th>
                  <th className="py-3.5 px-4 font-semibold">UPI ID</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Base Rate</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {creators.map((creator) => {
                  const isMutating = mutatingCreatorId === creator.id;
                  const isVerified = Boolean(creator.is_verified);

                  return (
                    <tr key={creator.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{creator.display_name}</div>
                        <div className="text-xs text-slate-400">{creator.handle}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {creator.niche || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-300">
                        {creator.pan_number || 'Not Provided'}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-300">
                        {creator.upi_id || 'Not Provided'}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-white">
                        ₹{Number(creator.starting_rate || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/80">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {isVerified ? (
                          <button
                            onClick={() => handleToggleVerification(creator, false)}
                            disabled={isMutating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                          >
                            {isMutating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            <span>Revoke</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleVerification(creator, true)}
                            disabled={isMutating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition disabled:opacity-50 shadow-sm"
                          >
                            {isMutating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Approve & Verify</span>
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Controls: search and status filter pills */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['All', 'Proposed', 'Accepted', 'In Review', 'Completed'] as const).map((filter) => {
                const isActive = dealStatusFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setDealStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals or creators..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 bg-slate-950/40">
                  <th className="py-3.5 px-5 font-semibold">Deal Title</th>
                  <th className="py-3.5 px-4 font-semibold">Creator</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Deal Value</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Platform Fee</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Invoice</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      No commercial deals found matching criteria.
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
                      <tr key={deal.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-5">
                          <div className="font-semibold text-white">{deal.title}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-slate-200 font-medium">{deal.creator_name}</div>
                          <div className="text-xs text-slate-500">{deal.creator_handle}</div>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-white">
                          ₹{Number(deal.total_amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-slate-300">
                          ₹{Number(deal.platform_fee).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {deal.status === 'PROPOSED' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/80">
                              Proposed
                            </span>
                          )}
                          {deal.status === 'ACCEPTED' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950/70 text-sky-300 border border-sky-800/80">
                              Accepted
                            </span>
                          )}
                          {deal.status === 'IN_REVIEW' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/70 text-purple-300 border border-purple-800/80">
                              In Review
                            </span>
                          )}
                          {deal.status === 'COMPLETED' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                              Completed
                            </span>
                          )}
                          {deal.status === 'DECLINED' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              Declined
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {deal.status === 'COMPLETED' ? (
                            <Link
                              href={`/invoices/${deal.id}`}
                              className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 underline font-medium"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{deal.invoice_number || 'View Invoice'}</span>
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right text-xs text-slate-400">
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
