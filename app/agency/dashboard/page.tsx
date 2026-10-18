'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Check, 
  ExternalLink, 
  FileText, 
  Clock, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  Inbox, 
  Calendar,
  Send,
  ShieldCheck,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import HeaderUserNav from '@/components/HeaderUserNav';
import { CreateKarLogo } from '@/components/Logo';
import { loadRazorpay } from '@/lib/loadRazorpay';
import type { Contract, Deliverable, ContractDeliverableItem, PaymentStatus } from '@/types/database';

interface AgencyContract extends Contract {
  creator_name?: string;
  creator_handle?: string;
  creator_avatar?: string;
  agency_name?: string;
  submitted_deliverables?: Deliverable[];
  payment_status?: PaymentStatus | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
}

const STATUS_FILTERS = ['All', 'Proposed', 'Active', 'In Review', 'Completed'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AgencyDashboardPage() {
  const [contracts, setContracts] = useState<AgencyContract[]>([]);
  const [currentUser, setCurrentUser] = useState<{ display_name: string; email: string } | null>(null);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Record<string, 'INR' | 'USD' | 'EUR'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');

  // Tracking mutations
  const [processingContractId, setProcessingContractId] = useState<string | null>(null);

  // Revision state: { [contractId]: boolean } and { [contractId]: string }
  const [revisionInputsOpen, setRevisionInputsOpen] = useState<Record<string, boolean>>({});
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.authenticated && data?.user) {
            setCurrentUser(data.user);
          }
        }
      } catch {
        // Silently ignore
      }
    }
    loadUser();
  }, []);

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

  // Handle Multi-Currency Razorpay Checkout
  const handleInitiatePayment = async (
    contract: AgencyContract,
    currency: 'INR' | 'USD' | 'EUR' = 'INR'
  ) => {
    setProcessingContractId(contract.id);
    const toastId = toast.loading('Initializing gateway checkout...');

    try {
      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) {
        toast.error('Unable to load payment gateway SDK.', { id: toastId });
        return;
      }

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: contract.id,
          feeType: 'PLATFORM_FEE',
          currency,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData?.error?.message || 'Failed to initialize payment order.');
      }

      toast.dismiss(toastId);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CreateKar',
        description: 'Agency Platform Convenience Fee (₹499) - Zero Creator Commission',
        order_id: orderData.orderId,
        prefill: {
          name: currentUser?.display_name || '',
          email: currentUser?.email || '',
        },
        theme: { color: '#0B0F14' },
        handler: async function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          const verifyToast = toast.loading('Verifying transaction...');
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: paymentResponse.razorpay_order_id,
                paymentId: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature,
                contractId: contract.id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success('Payment completed successfully. Platform fee settled.', { id: verifyToast });
              await fetchContracts();
            } else {
              toast.error(verifyData?.error || 'Payment verification failed', { id: verifyToast });
            }
          } catch {
            toast.error('Network error during verification', { id: verifyToast });
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment window closed. Fee remains pending.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error initiating payment.';
      toast.error(msg, { id: toastId });
    } finally {
      setProcessingContractId(null);
    }
  };

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
            <Link href="/agency/dashboard" className="text-ink font-bold border-b border-ink pb-0.5">
              Agency Desk
            </Link>
            <Link href="/settings" className="text-ink-muted hover:text-ink transition">
              Settings
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchContracts}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink bg-white border border-ledger hover:border-ink rounded-md transition disabled:opacity-50"
            title="Refresh Campaigns"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <HeaderUserNav />
        </div>
      </nav>

      {/* Header section */}
      <header className="mb-10 text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-seal-light border border-seal/30 text-seal text-[11px] font-mono uppercase tracking-widest font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Agency Operations Desk • Commercial Dispatch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-ink">
          Agency Campaign Operations
        </h1>
        <p className="mt-2 text-ink-muted text-sm sm:text-base max-w-2xl font-sans">
          Track commissioned briefs, audit submitted creator assets, settle agreements, and retrieve automated B2B GST tax invoices.
        </p>
      </header>

      {/* Filter Tabs */}
      <section className="mb-8 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none" role="tablist">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-ink text-paper border border-ink font-bold shadow-sm'
                  : 'bg-white text-ink-muted border border-ledger hover:text-ink hover:border-ink'
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
          <Loader2 className="w-8 h-8 text-seal animate-spin mb-4" />
          <p className="text-ink-muted text-xs font-mono uppercase tracking-wider">Accessing agency campaign records...</p>
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
      ) : filteredContracts.length === 0 ? (
        <div className="py-20 text-center bg-white border border-ledger rounded-md p-8 max-w-xl mx-auto shadow-sm">
          <Inbox className="w-10 h-10 text-ink-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-ink">No Briefs in &ldquo;{activeFilter}&rdquo;</h3>
          <p className="text-xs font-mono text-ink-muted mt-2 mb-6">
            Propose a new commercial campaign to creators from the verified registry to initiate tracking.
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
                className="bg-white border border-ledger rounded-md p-6 shadow-sm transition hover:border-ink"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-ledger">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-ink-muted mb-1 flex-wrap">
                      <span>Creator: <strong className="text-ink">{contract.creator_name}</strong> ({contract.creator_handle})</span>
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

                  {/* Status & Payment Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Payment Status Badge */}
                    {contract.payment_status === 'PAID' || contract.razorpay_payment_id ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider bg-pine-light text-pine border border-pine/30">
                        <ShieldCheck className="w-3 h-3 text-pine" />
                        Fee Settled
                      </span>
                    ) : contract.status !== 'DECLINED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider bg-seal-light text-seal border border-seal/30">
                        <CreditCard className="w-3 h-3 text-seal" />
                        Fee Pending
                      </span>
                    ) : null}

                    {contract.status === 'PROPOSED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider bg-paper text-ink border border-ledger">
                        <Clock className="w-3 h-3 text-seal" />
                        Proposed
                      </span>
                    )}
                    {contract.status === 'ACCEPTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider bg-pine-light text-pine border border-pine/30">
                        <Check className="w-3 h-3" />
                        Active (In Production)
                      </span>
                    )}
                    {contract.status === 'IN_REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider bg-paper text-ink border border-ink">
                        <Clock className="w-3 h-3 text-seal" />
                        In Review
                      </span>
                    )}
                    {contract.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider bg-pine-light text-pine border border-pine/30">
                        <Check className="w-3 h-3" />
                        Settled & Closed
                      </span>
                    )}
                    {contract.status === 'DECLINED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider bg-paper text-ink-muted border border-ledger">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-ledger text-sm">
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                      Agreed Consideration
                    </span>
                    <span className="text-2xl font-bold font-mono text-ink tracking-tight mt-0.5 block">
                      ₹{formattedBudget}
                    </span>
                    <p className="text-[11px] font-mono text-ink-muted mt-1">
                      Includes flat ₹499 statutory fee
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                      Deliverable Scope
                    </span>
                    <span className="text-sm font-bold font-display text-ink mt-1 block">
                      {deliverableType}
                    </span>
                    <p className="text-xs text-ink-muted mt-1 font-sans">
                      {contract.description || 'Verified commercial deliverable'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                      Agreed Deadline
                    </span>
                    <span className="text-sm font-bold font-mono text-ink mt-1 block">
                      {formattedDeadline}
                    </span>
                    <p className="text-xs text-ink-muted mt-1 font-mono">
                      Indian Standard Jurisdiction
                    </p>
                  </div>
                </div>

                {/* Platform Fee Checkout Card if unpaid and not declined */}
                {contract.payment_status !== 'PAID' && !contract.razorpay_payment_id && contract.status !== 'DECLINED' && (
                  <div className="mt-4 p-4 rounded-md bg-paper border border-ledger flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-seal">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Platform Convenience Fee Checkout</span>
                      </div>
                      <p className="text-xs font-mono text-ink-muted mt-0.5">
                        Flat ₹499 agency convenience fee for digital contract execution & automated GST invoices.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      {/* Currency Toggle */}
                      <div className="inline-flex items-center p-0.5 bg-white border border-ledger rounded-md text-xs font-mono">
                        {(['INR', 'USD', 'EUR'] as const).map((curr) => {
                          const activeCurr = selectedCurrencies[contract.id] || 'INR';
                          const isCurrActive = activeCurr === curr;
                          return (
                            <button
                              key={curr}
                              type="button"
                              onClick={() =>
                                setSelectedCurrencies((prev) => ({ ...prev, [contract.id]: curr }))
                              }
                              className={`px-2.5 py-1 rounded-sm text-[11px] font-mono uppercase font-bold transition ${
                                isCurrActive
                                  ? 'bg-ink text-paper shadow-sm'
                                  : 'text-ink-muted hover:text-ink'
                              }`}
                            >
                              {curr}
                            </button>
                          );
                        })}
                      </div>

                      {/* Pay Button */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          handleInitiatePayment(
                            contract,
                            selectedCurrencies[contract.id] || 'INR'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink hover:bg-black text-paper rounded-md text-xs font-mono uppercase tracking-wider font-bold shadow-sm transition disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-seal" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>
                              Pay {selectedCurrencies[contract.id] === 'USD' ? '$6 USD' : selectedCurrencies[contract.id] === 'EUR' ? '€6 EUR' : '₹499 INR'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Section */}
                <div className="pt-4">
                  {/* Status: IN_REVIEW -> Prominent Review Card with Actions */}
                  {contract.status === 'IN_REVIEW' && (
                    <div className="bg-paper border border-ledger rounded-md p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-seal uppercase tracking-wider mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            Deliverable Ready for Agency Audit
                          </span>
                          <h3 className="text-base font-bold font-display text-ink">
                            {latestDeliverable?.title || deliverableType}
                          </h3>
                        </div>

                        {submittedUrl && (
                          <a
                            href={submittedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-ledger hover:border-ink text-ink rounded-md text-xs font-mono uppercase tracking-wider font-bold transition shadow-sm"
                          >
                            <span>Inspect Asset</span>
                            <ExternalLink className="w-3.5 h-3.5 text-seal" />
                          </a>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 flex flex-wrap items-center justify-end gap-3 border-t border-ledger">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            setRevisionInputsOpen((prev) => ({
                              ...prev,
                              [contract.id]: !prev[contract.id],
                            }))
                          }
                          className="px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold text-ink-muted hover:text-seal border border-ledger hover:border-seal rounded-md transition disabled:opacity-50"
                        >
                          Request Revision
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(contract.id)}
                          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-mono uppercase tracking-wider font-bold text-white bg-pine hover:bg-pine/90 rounded-md shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Releasing...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Settle Deal</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Inline Revision Input Form */}
                      {isRevisionOpen && (
                        <div className="pt-4 border-t border-ledger space-y-3">
                          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink">
                            Revision Directive & Feedback
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
                            placeholder="Specify required corrections (e.g. adjust audio level, fix brand tag)..."
                            className="w-full px-3.5 py-2 bg-white border border-ledger rounded-md text-xs font-mono text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition disabled:opacity-50"
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
                              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleRequestRevision(contract.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-ink hover:bg-black text-paper rounded-md text-xs font-mono uppercase tracking-wider font-bold transition disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" />
                              <span>Issue Revision</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status: COMPLETED -> View Invoice Link */}
                  {contract.status === 'COMPLETED' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-pine-light border border-pine/30 rounded-md px-4 py-3">
                      <div className="flex items-center gap-2 text-pine text-xs font-mono font-bold">
                        <Check className="w-3.5 h-3.5 text-pine" />
                        <span>Deliverables approved and commercial contract closed.</span>
                      </div>

                      <Link
                        href={`/invoices/${contract.id}`}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-pine hover:bg-pine/90 text-white rounded-md text-xs font-mono uppercase tracking-wider font-bold transition shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Print Tax Invoice</span>
                      </Link>
                    </div>
                  )}

                  {/* Status: ACCEPTED */}
                  {contract.status === 'ACCEPTED' && (
                    <div className="text-xs font-mono text-ink-muted flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-seal" />
                      <span>Creator has executed the agreement and deliverable production is underway.</span>
                    </div>
                  )}

                  {/* Status: PROPOSED */}
                  {contract.status === 'PROPOSED' && (
                    <div className="text-xs font-mono text-ink-muted flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-seal" />
                      <span>Proposal recorded on ledger. Awaiting creator digital acceptance.</span>
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
