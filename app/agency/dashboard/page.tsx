'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  ExternalLink, 
  FileText, 
  Clock, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  Inbox, 
  Calendar,
  Send,
  X,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import type { Contract, Deliverable, ContractDeliverableItem } from '@/types/database';

interface AgencyContract extends Contract {
  creator_name?: string;
  creator_handle?: string;
  creator_avatar?: string;
  agency_name?: string;
  submitted_deliverables?: Deliverable[];
}

const STATUS_FILTERS = ['All', 'Proposed', 'Active', 'In Review', 'Completed'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AgencyDashboardPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<AgencyContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Tracking mutations
  const [processingContractId, setProcessingContractId] = useState<string | null>(null);

  // Revision state: { [contractId]: boolean } and { [contractId]: string }
  const [revisionInputsOpen, setRevisionInputsOpen] = useState<Record<string, boolean>>({});
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to load agency campaigns.');
      }

      setContracts(data.contracts || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching contracts.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Handle Approve & Settle
  const handleApprove = async (contractId: string) => {
    setProcessingContractId(contractId);
    const toastId = toast.loading('Approving deliverable and finalizing settlement...');

    try {
      const response = await fetch(`/api/contracts/${contractId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to approve deliverable.');
      }

      toast.success('Deliverable approved! B2B Tax Invoice generated.', { id: toastId });
      await fetchContracts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve deliverable.';
      toast.error(msg, { id: toastId });
    } finally {
      setProcessingContractId(null);
    }
  };

  // Handle Request Revision
  const handleRequestRevision = async (contractId: string) => {
    const notes = (revisionNotes[contractId] || '').trim();
    if (!notes) {
      toast.error('Please enter specific feedback notes for the creator revision.');
      return;
    }

    setProcessingContractId(contractId);
    const toastId = toast.loading('Sending revision request to creator...');

    try {
      const response = await fetch(`/api/contracts/${contractId}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to request revision.');
      }

      toast.success('Revision request sent to creator.', { id: toastId });
      setRevisionInputsOpen((prev) => ({ ...prev, [contractId]: false }));
      setRevisionNotes((prev) => ({ ...prev, [contractId]: '' }));
      await fetchContracts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request revision.';
      toast.error(msg, { id: toastId });
    } finally {
      setProcessingContractId(null);
    }
  };

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Proposed') return c.status === 'PROPOSED';
      if (activeFilter === 'Active') return c.status === 'ACCEPTED';
      if (activeFilter === 'In Review') return c.status === 'IN_REVIEW';
      if (activeFilter === 'Completed') return c.status === 'COMPLETED';
      return true;
    });
  }, [contracts, activeFilter]);

  // Handle Sign Out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    const toastId = toast.loading('Signing out...');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Signed out successfully.', { id: toastId });
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Error signing out', { id: toastId });
      setIsSigningOut(false);
    }
  };

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
            <Link href="/agency/dashboard" className="text-sky-400 font-semibold">
              Agency Dashboard
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchContracts}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Campaigns</span>
          </button>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-400 bg-red-950/30 border border-red-900/60 hover:bg-red-900/40 hover:text-red-300 rounded-xl transition disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Header section */}
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <CheckCircle className="w-3.5 h-3.5" />
          Agency Campaign Management
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Brand Campaigns & Settlements
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl">
          Track campaign deliverables, review submitted creator assets, settle agreements, and download automated GST invoices.
        </p>
      </header>

      {/* Filter Tabs */}
      <section className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
              role="tab"
              aria-selected={isActive}
            >
              {filter}
            </button>
          );
        })}
      </section>

      {/* Content Area */}
      {isLoading && contracts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading agency campaigns...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-red-950/20 border border-red-900/50 rounded-2xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">Error Loading Campaigns</h3>
          <p className="text-sm text-slate-400 mt-1 mb-5">{errorMessage}</p>
          <button
            onClick={fetchContracts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 max-w-xl mx-auto">
          <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No Campaigns in "{activeFilter}"</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Propose a new campaign to creators from the verified directory to start tracking deliverables.
          </p>
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-sky-950/40"
          >
            <span>Discover Verified Creators</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredContracts.map((contract) => {
            const isProcessing = processingContractId === contract.id;
            const deliverablesList = contract.deliverables as ContractDeliverableItem[] | undefined;
            const deliverableType = deliverablesList?.[0]?.format || deliverablesList?.[0]?.title || 'Campaign Deliverable';

            const formattedBudget = Number(contract.total_amount).toLocaleString('en-IN');
            const formattedDeadline = contract.deadline
              ? new Date(contract.deadline).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Flexible';

            const latestDeliverable = contract.submitted_deliverables?.[0];
            const submittedUrl = latestDeliverable?.file_url;
            const isRevisionOpen = Boolean(revisionInputsOpen[contract.id]);

            return (
              <article
                key={contract.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl transition hover:border-slate-700"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                      <span>Creator: <strong className="text-slate-200">{contract.creator_name}</strong> ({contract.creator_handle})</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {contract.title}
                    </h2>

                    {/* Cryptographic Integrity Seal */}
                    {contract.signature_hash && ['ACCEPTED', 'IN_REVIEW', 'COMPLETED'].includes(contract.status) ? (
                      <div className="mt-2.5 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-200">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>Digitally Executed Agreement</span>
                          </div>
                          {(contract.accepted_at || contract.accepted_ip) && (
                            <p className="text-slate-400 text-[11px] pl-5 sm:pl-5">
                              {contract.accepted_at
                                ? `Accepted on ${new Date(contract.accepted_at).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}`
                                : ''}
                              {contract.accepted_ip ? ` • IP: ${contract.accepted_ip}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 self-start sm:self-auto">
                          SHA-256: <span className="text-emerald-400">{contract.signature_hash.slice(0, 10)}...{contract.signature_hash.slice(-8)}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {contract.status === 'PROPOSED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/80">
                        <Clock className="w-3.5 h-3.5" />
                        Proposed
                      </span>
                    )}
                    {contract.status === 'ACCEPTED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/70 text-sky-300 border border-sky-800/80">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active (In Production)
                      </span>
                    )}
                    {contract.status === 'IN_REVIEW' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/70 text-purple-300 border border-purple-800/80">
                        <Clock className="w-3.5 h-3.5" />
                        In Review
                      </span>
                    )}
                    {contract.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed & Settled
                      </span>
                    )}
                    {contract.status === 'DECLINED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-slate-800 text-sm">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Agreed Budget
                    </span>
                    <span className="text-2xl font-bold text-white tracking-tight mt-0.5 block">
                      ₹{formattedBudget}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Includes flat ₹499 platform fee
                    </p>
                  </div>

                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Deliverable Scope
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {deliverableType}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {contract.description || 'Verified commercial deliverable'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Agreed Deadline
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {formattedDeadline}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Campaign timeline
                    </p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="pt-4">
                  {/* Status: IN_REVIEW -> Prominent Review Card with Actions */}
                  {contract.status === 'IN_REVIEW' && (
                    <div className="bg-slate-950/80 border border-purple-900/60 rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            Deliverable Ready for Agency Review
                          </span>
                          <h3 className="text-base font-semibold text-white">
                            {latestDeliverable?.title || deliverableType}
                          </h3>
                        </div>

                        {submittedUrl && (
                          <a
                            href={submittedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-sky-400 hover:text-sky-300 rounded-xl text-sm font-medium transition"
                          >
                            <span>Open Submitted Asset</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            setRevisionInputsOpen((prev) => ({
                              ...prev,
                              [contract.id]: !prev[contract.id],
                            }))
                          }
                          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
                        >
                          Request Revision
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(contract.id)}
                          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve & Settle</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Inline Revision Input Form */}
                      {isRevisionOpen && (
                        <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in">
                          <label className="block text-xs font-medium text-slate-300">
                            Revision Feedback Notes
                          </label>
                          <textarea
                            rows={2}
                            disabled={isProcessing}
                            value={revisionNotes[contract.id] || ''}
                            onChange={(e) =>
                              setRevisionNotes((prev) => ({
                                ...prev,
                                [contract.id]: e.target.value,
                              }))
                            }
                            placeholder="Specify edits needed (e.g. adjust audio mix, correct brand tag)..."
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition disabled:opacity-50"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setRevisionInputsOpen((prev) => ({
                                  ...prev,
                                  [contract.id]: false,
                                }))
                              }
                              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleRequestRevision(contract.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Feedback</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status: COMPLETED -> View Invoice Link */}
                  {contract.status === 'COMPLETED' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Deliverables approved and settled.</span>
                      </div>

                      <Link
                        href={`/invoices/${contract.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-emerald-950/30"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Invoice</span>
                      </Link>
                    </div>
                  )}

                  {/* Status: ACCEPTED */}
                  {contract.status === 'ACCEPTED' && (
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>Creator has accepted the campaign and is preparing deliverables.</span>
                    </div>
                  )}

                  {/* Status: PROPOSED */}
                  {contract.status === 'PROPOSED' && (
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Proposal delivered to creator inbox. Awaiting response.</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
