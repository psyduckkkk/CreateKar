'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  Upload, 
  Clock, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  Inbox, 
  AlertCircle,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import HeaderUserNav from '@/components/HeaderUserNav';
import { CreateKarLogo } from '@/components/Logo';
import type { ContractDeliverableItem, DashboardContract, Profile } from '@/types/database';

export default function CreatorDashboardPage() {
  const [contracts, setContracts] = useState<DashboardContract[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Per-contract mutation tracking
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Asset URL inputs for ACCEPTED contracts: { [contractId]: string }
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            setProfile(data.profile);
          }
        }
      } catch {
        // Silently ignore if unauthenticated or network error
      }
    }
    loadProfile();
  }, []);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to load creator deals.');
      }

      setContracts(data.contracts || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Handle Accept or Decline action
  const handleUpdateStatus = async (contractId: string, newStatus: 'ACCEPTED' | 'DECLINED') => {
    setActiveActionId(contractId);
    const actionLabel = newStatus === 'ACCEPTED' ? 'Accepting deal...' : 'Declining deal...';
    const toastId = toast.loading(actionLabel);

    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || `Failed to update contract status to ${newStatus}.`);
      }

      toast.success(
        newStatus === 'ACCEPTED'
          ? 'Contract executed with cryptographic SHA-256 seal!'
          : 'Deal declined.',
        { id: toastId }
      );

      // Refresh data
      await fetchContracts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating deal status.';
      toast.error(msg, { id: toastId });
    } finally {
      setActiveActionId(null);
    }
  };

  // Handle Deliverable Submission
  const handleSubmitDeliverable = async (contract: DashboardContract) => {
    const assetUrl = (submissionUrls[contract.id] || '').trim();

    if (!assetUrl) {
      toast.error('Please enter a valid asset link (Google Drive, Dropbox, or video URL).');
      return;
    }

    if (!assetUrl.startsWith('http://') && !assetUrl.startsWith('https://')) {
      toast.error('Asset link must begin with https:// or http://');
      return;
    }

    setActiveActionId(contract.id);
    const toastId = toast.loading('Submitting deliverable for agency review...');

    const deliverablesList = contract.deliverables as ContractDeliverableItem[] | undefined;
    const deliverableTitle = deliverablesList?.[0]?.title || contract.title;
    const deliverableFormat = deliverablesList?.[0]?.format || 'Standard Deliverable';

    try {
      const response = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: contract.id,
          title: deliverableTitle,
          format: deliverableFormat,
          file_url: assetUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to submit deliverable.');
      }

      toast.success('Deliverable submitted successfully! Awaiting agency review.', { id: toastId });

      // Clear input and reload
      setSubmissionUrls((prev) => ({ ...prev, [contract.id]: '' }));
      await fetchContracts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting deliverable.';
      toast.error(msg, { id: toastId });
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between pb-6 mb-8 border-b border-dark-border">
        <div className="flex items-center gap-6">
          <CreateKarLogo size="md" href="/" />
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link 
              href="/creators" 
              className="hover:text-white transition"
            >
              Creators
            </Link>
            <Link 
              href="/dashboard" 
              className="text-white font-semibold border-b-2 border-indigo-500 pb-1"
            >
              Creator Desk
            </Link>
            <Link 
              href="/agency/dashboard" 
              className="hover:text-white transition"
            >
              Agency Desk
            </Link>
            <Link 
              href="/settings" 
              className="hover:text-white transition"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchContracts}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-dark-surface border border-dark-border hover:border-slate-700 hover:text-white rounded-xl transition disabled:opacity-50"
            title="Refresh Deals"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <HeaderUserNav />
        </div>
      </nav>

      {/* Dismissible Setup Banner */}
      {!isBannerDismissed && profile && (!profile.upi_id || !profile.starting_rate) && (
        <div className="mb-8 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-200 shadow-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <p className="text-sm">
              <strong className="text-white font-semibold mr-1">Action Required:</strong>
              Complete your profile to receive direct agency bookings and UPI payouts.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
            <Link
              href="/settings"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-950/50"
            >
              Complete Profile
            </Link>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header section */}
      <header className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
          <Inbox className="w-3.5 h-3.5 text-indigo-400" />
          <span>Creator Operations Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          Active Campaigns & Contracts
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl font-sans">
          Review brand briefs, execute agreements with cryptographic integrity seals, and submit deliverables for direct settlement.
        </p>
      </header>

      {/* Main Content Area */}
      {isLoading && contracts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading campaign deals...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-red-950/30 border border-red-900/50 rounded-2xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-white">Error Loading Deals</h3>
          <p className="text-sm text-slate-400 mt-1 mb-5">{errorMessage}</p>
          <button
            onClick={fetchContracts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-elevated hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : contracts.length === 0 ? (
        <div className="py-20 text-center bg-dark-surface border border-dark-border rounded-2xl p-8 max-w-xl mx-auto shadow-xl">
          <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-white">No Deals in Inbox Yet</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            When agencies send campaign proposals, they will appear here with full deliverable specifications and statutory fee schedules.
          </p>
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-950/60"
          >
            <span>Explore Creator Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {contracts.map((contract) => {
            const isMutating = activeActionId === contract.id;
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

            return (
              <article
                key={contract.id}
                className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl transition hover:border-slate-700"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-dark-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 flex-wrap">
                      <span>Agency: <strong className="text-slate-200">{contract.agency_name || 'Brand Studio'}</strong></span>
                      <span>•</span>
                      <span>Creator: <strong className="text-slate-200">{contract.creator_name || 'Verified Creator'}</strong> ({contract.creator_handle || ''})</span>
                    </div>
                    <h2 className="text-xl font-bold font-display text-white tracking-tight">
                      {contract.title}
                    </h2>

                    {/* Cryptographic Integrity Seal */}
                    {contract.signature_hash && ['ACCEPTED', 'IN_REVIEW', 'COMPLETED'].includes(contract.status) ? (
                      <div className="mt-3 p-3 bg-dark/70 border border-dark-border rounded-xl text-slate-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-400 text-xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>Executed Agreement • Cryptographic Audit Record</span>
                          </div>
                          {(contract.accepted_at || contract.accepted_ip) && (
                            <p className="text-slate-400 text-[11px] pl-5">
                              {contract.accepted_at
                                ? `Executed: ${new Date(contract.accepted_at).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}`
                                : ''}
                              {contract.accepted_ip ? ` • IP: ${contract.accepted_ip}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 bg-dark-elevated px-2.5 py-1 rounded-lg border border-dark-border self-start sm:self-auto font-mono">
                          SHA-256: <span className="font-bold text-emerald-400">{contract.signature_hash.slice(0, 10)}...{contract.signature_hash.slice(-8)}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {contract.status === 'PROPOSED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60">
                        <Clock className="w-3.5 h-3.5" />
                        Proposed
                      </span>
                    )}
                    {contract.status === 'ACCEPTED' && (
                      contract.deliverable_status === 'REVISION_REQUESTED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/70 text-red-300 border border-red-800/60">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Revision Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800/60">
                          <Check className="w-3.5 h-3.5" />
                          Active / In Progress
                        </span>
                      )
                    )}
                    {contract.status === 'IN_REVIEW' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/70 text-violet-300 border border-violet-800/60">
                        <Upload className="w-3.5 h-3.5" />
                        In Review
                      </span>
                    )}
                    {contract.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                        <Check className="w-3.5 h-3.5" />
                        Completed & Settled
                      </span>
                    )}
                    {contract.status === 'DECLINED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-dark-elevated text-slate-400 border border-dark-border">
                        <X className="w-3.5 h-3.5" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-dark-border text-sm">
                  {/* Budget */}
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Agreed Budget
                    </span>
                    <span className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5 block">
                      ₹{formattedBudget}
                    </span>
                    <p className="text-xs text-indigo-400 mt-1">
                      0% creator deduction. Flat ₹499 fee covered.
                    </p>
                  </div>

                  {/* Deliverable Type */}
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Deliverable Scope
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {deliverableType}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      {contract.description || 'Verified commercial package'}
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Submission Deadline
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block font-mono">
                      {formattedDeadline}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Indian Standard Jurisdiction
                    </p>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="pt-4">
                  {/* Status: PROPOSED -> Show Accept and Decline buttons */}
                  {contract.status === 'PROPOSED' && (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleUpdateStatus(contract.id, 'DECLINED')}
                        disabled={isMutating}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-dark-elevated rounded-xl transition disabled:opacity-50"
                      >
                        {isMutating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>Decline Offer</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(contract.id, 'ACCEPTED')}
                        disabled={isMutating}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isMutating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sealing Agreement...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept & Execute Contract</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Status: ACCEPTED -> Show Inline Deliverable Submission Form */}
                  {contract.status === 'ACCEPTED' && (() => {
                    const isRevision = 
                      contract.deliverable_status === 'REVISION_REQUESTED' || 
                      Boolean(contract.revision_notes);
                    const prevSubmission = contract.last_submitted_url || submittedUrl;

                    return (
                      <div className="bg-dark/80 border border-dark-border rounded-xl p-5">
                        {/* Revision Feedback Alert Box */}
                        {isRevision && contract.revision_notes && (
                          <div className="mb-4 bg-red-950/30 border border-red-900/50 rounded-xl p-4 text-red-200">
                            <div className="flex items-center gap-1.5 font-semibold text-xs mb-1.5">
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <span>Agency Revision Requested</span>
                            </div>

                            <p className="text-xs text-red-100 bg-red-950/50 p-3 rounded-lg border border-red-900/60 italic mb-2">
                              &ldquo;{contract.revision_notes}&rdquo;
                            </p>

                            {prevSubmission && (
                              <div className="text-[11px] text-red-300/80 pt-1 flex items-center gap-1.5">
                                <span>Previous Asset Link:</span>
                                <a
                                  href={prevSubmission}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-medium"
                                >
                                  <span className="truncate max-w-xs sm:max-w-md">{prevSubmission}</span>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                          <Upload className="w-4 h-4 text-indigo-400" />
                          <span>{isRevision ? 'Submit Updated Deliverable Link' : 'Submit Deliverable for Review'}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-4 font-sans">
                          {isRevision
                            ? 'Review the feedback above and submit your corrected asset link (Google Drive, Dropbox, or video URL).'
                            : 'Provide a direct viewable link to your final deliverable (Google Drive, Dropbox, Figma, or video file).'}
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input
                            type="url"
                            required
                            disabled={isMutating}
                            value={submissionUrls[contract.id] || ''}
                            onChange={(e) =>
                              setSubmissionUrls((prev) => ({
                                ...prev,
                                [contract.id]: e.target.value,
                              }))
                            }
                            placeholder="https://drive.google.com/... or https://youtu.be/..."
                            className="flex-1 px-3.5 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                          />
                          <button
                            onClick={() => handleSubmitDeliverable(contract)}
                            disabled={isMutating}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md shadow-indigo-950/50 disabled:opacity-50 whitespace-nowrap"
                          >
                            {isMutating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>{isRevision ? 'Resubmit Deliverable' : 'Submit for Review'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Status: IN_REVIEW -> Show Awaiting Agency Approval Badge & Link */}
                  {contract.status === 'IN_REVIEW' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-violet-950/20 border border-violet-900/40 rounded-xl px-4 py-3 text-xs">
                      <div className="flex items-center gap-2 text-violet-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                        <span>Deliverable Submitted • Awaiting Agency Audit & Release</span>
                      </div>

                      {submittedUrl && (
                        <a
                          href={submittedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 underline font-semibold"
                        >
                          <span>Inspect Submitted Asset</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status: COMPLETED -> Finished Deal Notice */}
                  {contract.status === 'COMPLETED' && (
                    <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/40 rounded-xl px-4 py-3 text-xs text-emerald-300">
                      <div className="flex items-center gap-2 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Deliverables approved and commercial contract closed.</span>
                      </div>
                      {submittedUrl && (
                        <a
                          href={submittedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                        >
                          <span>Archived Asset</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status: DECLINED */}
                  {contract.status === 'DECLINED' && (
                    <p className="text-xs text-slate-500 italic">
                      This proposal was recorded as declined.
                    </p>
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
