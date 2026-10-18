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
  ArrowRight
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
    const actionLabel = newStatus === 'ACCEPTED' ? 'Recording acceptance...' : 'Recording decline...';
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
          ? 'Contract executed with cryptographic seal. Submit deliverables when ready.'
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

      toast.success('Deliverable submitted to ledger for agency review.', { id: toastId });

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
    <main className="min-h-screen bg-paper text-ink py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between pb-6 mb-8 border-b border-ledger">
        <div className="flex items-center gap-6">
          <CreateKarLogo size="md" href="/" />
          <div className="hidden sm:flex items-center gap-5 text-xs font-mono uppercase tracking-wider">
            <Link 
              href="/creators" 
              className="text-ink-muted hover:text-ink transition"
            >
              Registry
            </Link>
            <Link 
              href="/dashboard" 
              className="text-ink font-bold border-b border-ink pb-0.5"
            >
              Creator Desk
            </Link>
            <Link 
              href="/agency/dashboard" 
              className="text-ink-muted hover:text-ink transition"
            >
              Agency Desk
            </Link>
            <Link 
              href="/settings" 
              className="text-ink-muted hover:text-ink transition"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchContracts}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink bg-white border border-ledger hover:border-ink rounded-md transition disabled:opacity-50"
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
        <div className="mb-8 p-4 rounded-md bg-seal-light border border-seal/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-seal shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-seal flex-shrink-0" />
            <p className="text-xs font-mono text-ink">
              <strong className="text-seal uppercase tracking-wider mr-1">[ Action Required ]</strong>
              Complete your profile to receive direct agency bookings and UPI payouts.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
            <Link
              href="/settings"
              className="px-3 py-1.5 bg-seal hover:bg-seal-hover text-white rounded-md text-xs font-mono uppercase tracking-wider font-bold transition shadow-sm"
            >
              Complete Profile
            </Link>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 text-ink-muted hover:text-ink rounded transition"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header section */}
      <header className="mb-10 text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-seal-light border border-seal/30 text-seal text-[11px] font-mono uppercase tracking-widest font-semibold mb-3">
          <Inbox className="w-3.5 h-3.5" />
          <span>Creator Operations Desk • Commercial Briefs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-ink">
          Commercial Deal Operations
        </h1>
        <p className="mt-2 text-ink-muted text-sm sm:text-base max-w-2xl font-sans">
          Review incoming brand campaign briefs, execute agreements with cryptographic integrity seals, and submit verified deliverable assets.
        </p>
      </header>

      {/* Main Content Area */}
      {isLoading && contracts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-seal animate-spin mb-4" />
          <p className="text-ink-muted text-xs font-mono uppercase tracking-wider">Accessing commercial ledger...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-seal-light border border-seal/30 rounded-md text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-seal mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-ink">Query Exception</h3>
          <p className="text-xs font-mono text-ink-muted mt-1 mb-5">{errorMessage}</p>
          <button
            onClick={fetchContracts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-black text-paper rounded-md text-xs font-mono uppercase tracking-wider transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Query
          </button>
        </div>
      ) : contracts.length === 0 ? (
        <div className="py-20 text-center bg-white border border-ledger rounded-md p-8 max-w-xl mx-auto shadow-sm">
          <Inbox className="w-10 h-10 text-ink-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-ink">No Commercial Deals Recorded</h3>
          <p className="text-xs font-mono text-ink-muted mt-2 mb-6">
            When contracting agencies issue proposals, they will appear here with complete deliverable specifications and statutory fee schedules.
          </p>
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-black text-paper text-xs font-mono uppercase tracking-wider font-bold rounded-md transition"
          >
            <span>Explore Creator Registry</span>
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

            // Find any submitted deliverable asset url
            const latestDeliverable = contract.submitted_deliverables?.[0];
            const submittedUrl = latestDeliverable?.file_url;

            return (
              <article
                key={contract.id}
                className="bg-white border border-ledger rounded-md p-6 shadow-sm transition hover:border-ink"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-ledger">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-ink-muted mb-1 flex-wrap">
                      <span>Agency: <strong className="text-ink">{contract.agency_name || 'Brand Studio'}</strong></span>
                      <span>•</span>
                      <span>Creator: <strong className="text-ink">{contract.creator_name || 'Verified Creator'}</strong> ({contract.creator_handle || ''})</span>
                    </div>
                    <h2 className="text-xl font-bold font-display text-ink tracking-tight">
                      {contract.title}
                    </h2>

                    {/* Cryptographic Integrity Seal */}
                    {contract.signature_hash && ['ACCEPTED', 'IN_REVIEW', 'COMPLETED'].includes(contract.status) ? (
                      <div className="mt-3 p-2.5 bg-paper border border-ledger rounded-md text-ink text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-ink text-[11px] uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5 text-seal flex-shrink-0" />
                            <span>Executed Agreement • Cryptographic Audit Record</span>
                          </div>
                          {(contract.accepted_at || contract.accepted_ip) && (
                            <p className="text-ink-muted text-[11px] pl-5">
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
                        <div className="text-[10px] text-ink-muted bg-white px-2 py-1 rounded-sm border border-ledger self-start sm:self-auto font-mono">
                          SHA-256: <span className="font-bold text-ink">{contract.signature_hash.slice(0, 10)}...{contract.signature_hash.slice(-8)}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {contract.status === 'PROPOSED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono uppercase font-bold tracking-wider bg-paper text-ink border border-ledger">
                        <Clock className="w-3 h-3 text-seal" />
                        Proposed
                      </span>
                    )}
                    {contract.status === 'ACCEPTED' && (
                      contract.deliverable_status === 'REVISION_REQUESTED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono uppercase font-bold tracking-wider bg-seal-light text-seal border border-seal/30">
                          <AlertCircle className="w-3 h-3" />
                          Revision Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono uppercase font-bold tracking-wider bg-pine-light text-pine border border-pine/30">
                          <Check className="w-3 h-3" />
                          Accepted / In Progress
                        </span>
                      )
                    )}
                    {contract.status === 'IN_REVIEW' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono uppercase font-bold tracking-wider bg-paper text-ink border border-ink">
                        <Upload className="w-3 h-3 text-seal" />
                        In Review
                      </span>
                    )}
                    {contract.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono uppercase font-bold tracking-wider bg-pine-light text-pine border border-pine/30">
                        <Check className="w-3 h-3" />
                        Settled & Closed
                      </span>
                    )}
                    {contract.status === 'DECLINED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono uppercase font-bold tracking-wider bg-paper text-ink-muted border border-ledger">
                        <X className="w-3 h-3" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-ledger text-sm">
                  {/* Budget & Fee notice */}
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                      Gross Consideration
                    </span>
                    <span className="text-2xl font-bold font-mono text-ink tracking-tight mt-0.5 block">
                      ₹{formattedBudget}
                    </span>
                    <p className="text-[11px] font-mono text-ink-muted mt-1">
                      Zero creator deduction. Flat ₹499 agency fee covered.
                    </p>
                  </div>

                  {/* Deliverable Type */}
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                      Deliverable Scope
                    </span>
                    <span className="text-sm font-bold font-display text-ink mt-1 block">
                      {deliverableType}
                    </span>
                    <p className="text-xs text-ink-muted mt-1 font-sans">
                      {contract.description || 'Standard verified creator package'}
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                      Stipulated Deadline
                    </span>
                    <span className="text-sm font-bold font-mono text-ink mt-1 block">
                      {formattedDeadline}
                    </span>
                    <p className="text-xs text-ink-muted mt-1 font-mono">
                      Indian Standard Jurisdiction
                    </p>
                  </div>
                </div>

                {/* Status-specific Action Sections */}
                <div className="pt-4">
                  {/* Status: PROPOSED -> Show Accept and Decline buttons */}
                  {contract.status === 'PROPOSED' && (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleUpdateStatus(contract.id, 'DECLINED')}
                        disabled={isMutating}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-seal border border-ledger hover:border-seal rounded-md transition disabled:opacity-50"
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
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-mono uppercase tracking-wider font-bold text-white bg-pine hover:bg-pine/90 rounded-md shadow-sm transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isMutating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sealing Agreement...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Execute Agreement</span>
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
                      <div className="bg-paper border border-ledger rounded-md p-5">
                        {/* Revision Feedback Alert Box */}
                        {isRevision && contract.revision_notes && (
                          <div className="mb-4 bg-seal-light border border-seal/30 rounded-md p-4 text-seal">
                            <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold mb-1.5">
                              <AlertCircle className="w-4 h-4 text-seal flex-shrink-0" />
                              <span>Agency Revision Notice</span>
                            </div>

                            <p className="text-xs font-mono text-ink bg-white p-3 rounded-md border border-seal/20 italic mb-2">
                              &ldquo;{contract.revision_notes}&rdquo;
                            </p>

                            {prevSubmission && (
                              <div className="text-[11px] font-mono text-ink-muted pt-1 flex items-center gap-1.5">
                                <span>Previous Asset Link:</span>
                                <a
                                  href={prevSubmission}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-seal hover:underline font-bold"
                                >
                                  <span className="truncate max-w-xs sm:max-w-md">{prevSubmission}</span>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink mb-1 flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5 text-seal" />
                          <span>{isRevision ? 'Submit Corrected Deliverable Link' : 'Submit Deliverable for Review'}</span>
                        </h3>
                        <p className="text-xs text-ink-muted mb-4 font-sans">
                          {isRevision
                            ? 'Review the feedback above and supply your updated asset URL (Google Drive, Dropbox, or video link).'
                            : 'Provide a direct accessible URL to your final deliverable (Google Drive, Dropbox, Figma, or video file).'}
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
                            className="flex-1 px-3.5 py-2.5 bg-white border border-ledger rounded-md text-xs font-mono text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition disabled:opacity-50"
                          />
                          <button
                            onClick={() => handleSubmitDeliverable(contract)}
                            disabled={isMutating}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-bold text-paper bg-ink hover:bg-black rounded-md transition shadow-sm disabled:opacity-50 whitespace-nowrap"
                          >
                            {isMutating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Recording...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>{isRevision ? 'Resubmit to Desk' : 'Submit Deliverable'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Status: IN_REVIEW -> Show Awaiting Agency Approval Badge & Link */}
                  {contract.status === 'IN_REVIEW' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper border border-ledger rounded-md px-4 py-3 text-xs font-mono">
                      <div className="flex items-center gap-2 text-ink font-semibold">
                        <Clock className="w-3.5 h-3.5 text-seal flex-shrink-0" />
                        <span>Deliverable Submitted • Awaiting Agency Audit & Release</span>
                      </div>

                      {submittedUrl && (
                        <a
                          href={submittedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-seal hover:underline font-bold"
                        >
                          <span>Inspect Submitted Asset</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status: COMPLETED -> Finished Deal Notice */}
                  {contract.status === 'COMPLETED' && (
                    <div className="flex items-center justify-between bg-pine-light border border-pine/30 rounded-md px-4 py-3 text-xs font-mono text-pine">
                      <div className="flex items-center gap-2 font-bold">
                        <Check className="w-3.5 h-3.5 text-pine flex-shrink-0" />
                        <span>Deliverable Approved & Contract Concluded</span>
                      </div>
                      {submittedUrl && (
                        <a
                          href={submittedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-pine hover:underline font-bold"
                        >
                          <span>Archived Asset</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status: DECLINED */}
                  {contract.status === 'DECLINED' && (
                    <p className="text-xs font-mono text-ink-muted italic">
                      Proposal recorded as declined by creator.
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
