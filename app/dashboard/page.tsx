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
  Sparkles
} from 'lucide-react';
import type { Deliverable, ContractDeliverableItem, DashboardContract } from '@/types/database';

export default function CreatorDashboardPage() {
  const [contracts, setContracts] = useState<DashboardContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Per-contract mutation tracking
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Asset URL inputs for ACCEPTED contracts: { [contractId]: string }
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});

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
          ? 'Deal accepted! You can now submit your deliverable.'
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
      toast.error('Please enter a valid asset link (Google Drive, Dropbox, or unlisted video).');
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

      toast.success('Deliverable submitted successfully! Awaiting agency approval.', { id: toastId });

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
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <Link href="/creators" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-sky-500">Create</span>Kar
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link 
              href="/creators" 
              className="text-slate-400 hover:text-white transition"
            >
              Creator Directory
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sky-400 font-semibold"
            >
              Deals Inbox
            </Link>
          </div>
        </div>

        <button
          onClick={fetchContracts}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Inbox
        </button>
      </nav>

      {/* Header section */}
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Inbox className="w-3.5 h-3.5" />
          Creator Deals Inbox
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Active Campaigns & Contracts
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl">
          Review incoming brand campaign proposals, accept or decline offers, and submit completed deliverables for agency review.
        </p>
      </header>

      {/* Main Content Area */}
      {isLoading && contracts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading campaign deals...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-red-950/20 border border-red-900/50 rounded-2xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">Error Loading Deals</h3>
          <p className="text-sm text-slate-400 mt-1 mb-5">{errorMessage}</p>
          <button
            onClick={fetchContracts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : contracts.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 max-w-xl mx-auto">
          <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No Deals in Inbox Yet</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            When agencies send campaign proposals, they will appear here with full deliverable specifications and budget terms.
          </p>
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-sky-950/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Verified Creators</span>
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
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl transition hover:border-slate-700"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                      <span>Agency: {contract.agency_name || 'CreateKar Brand Studio'}</span>
                      <span>•</span>
                      <span>Creator: {contract.creator_name || 'Verified Creator'} ({contract.creator_handle || ''})</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {contract.title}
                    </h2>
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
                      contract.deliverable_status === 'REVISION_REQUESTED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/80">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Revision Requested
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/70 text-sky-300 border border-sky-800/80">
                          <Check className="w-3.5 h-3.5" />
                          Accepted
                        </span>
                      )
                    )}
                    {contract.status === 'IN_REVIEW' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/70 text-purple-300 border border-purple-800/80">
                        <Upload className="w-3.5 h-3.5" />
                        In Review
                      </span>
                    )}
                    {contract.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                        <Check className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                    {contract.status === 'DECLINED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        <X className="w-3.5 h-3.5" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-slate-800 text-sm">
                  {/* Budget & Fee notice */}
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Proposed Budget
                    </span>
                    <span className="text-2xl font-bold text-white tracking-tight mt-0.5 block">
                      ₹{formattedBudget}
                    </span>
                    <p className="text-xs text-sky-400/90 mt-1">
                      Zero commission. Flat ₹499 agency fee covered.
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
                    <p className="text-xs text-slate-500 mt-1">
                      {contract.description || 'Standard verified creator package'}
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Submission Deadline
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {formattedDeadline}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Delivery date agreed with client
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
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
                      >
                        {isMutating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(contract.id, 'ACCEPTED')}
                        disabled={isMutating}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-950/40 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isMutating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Accept Deal</span>
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
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5">
                        {/* Revision Feedback Alert Box */}
                        {isRevision && contract.revision_notes && (
                          <div className="mb-4 bg-amber-950/30 border border-amber-800/80 rounded-xl p-4 text-amber-200">
                            <div className="flex items-center gap-2 font-semibold text-amber-300 text-sm mb-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              <span>Revision Requested by Agency</span>
                            </div>

                            <p className="text-sm text-amber-100 bg-amber-950/50 p-3 rounded-lg border border-amber-900/60 italic mb-2">
                              "{contract.revision_notes}"
                            </p>

                            {prevSubmission && (
                              <div className="text-xs text-amber-300/90 pt-1 flex items-center gap-1.5">
                                <span>Previous submission:</span>
                                <a
                                  href={prevSubmission}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 underline font-medium"
                                >
                                  <span className="truncate max-w-xs sm:max-w-md">{prevSubmission}</span>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                          <Upload className="w-4 h-4 text-sky-400" />
                          <span>{isRevision ? 'Submit Updated Deliverable Link' : 'Submit Deliverable'}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                          {isRevision
                            ? 'Review the agency feedback above and submit your updated asset link (Google Drive, Dropbox, or unlisted video).'
                            : 'Provide a viewable link to your final deliverable asset (Google Drive, Dropbox, Figma, or unlisted YouTube video).'}
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
                            className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition disabled:opacity-50"
                          />
                          <button
                            onClick={() => handleSubmitDeliverable(contract)}
                            disabled={isMutating}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-md shadow-sky-950/40 disabled:opacity-50 whitespace-nowrap"
                          >
                            {isMutating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>{isRevision ? 'Resubmit for Review' : 'Submit for Review'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Status: IN_REVIEW -> Show Awaiting Agency Approval Badge & Link */}
                  {contract.status === 'IN_REVIEW' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-950/20 border border-purple-900/50 rounded-xl px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 text-purple-300 font-medium">
                        <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span>Submitted — Awaiting Agency Approval</span>
                      </div>

                      {submittedUrl && (
                        <a
                          href={submittedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 underline font-medium"
                        >
                          <span>View Submitted Asset</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status: COMPLETED -> Finished Deal Notice */}
                  {contract.status === 'COMPLETED' && (
                    <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-sm text-emerald-300">
                      <div className="flex items-center gap-2 font-medium">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Campaign Deliverables Approved & Finalized</span>
                      </div>
                      {submittedUrl && (
                        <a
                          href={submittedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                        >
                          <span>View Asset</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status: DECLINED */}
                  {contract.status === 'DECLINED' && (
                    <p className="text-xs text-slate-500 italic">
                      This proposal was declined by the creator.
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
