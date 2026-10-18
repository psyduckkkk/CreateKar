'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  X, 
  Loader2, 
  IndianRupee, 
  Calendar, 
  Layers, 
  CreditCard,
  Globe,
  ShieldCheck,
  Check,
  ArrowRight
} from 'lucide-react';
import { loadRazorpay } from '@/lib/loadRazorpay';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    display_name: string;
    handle: string;
    starting_rate: number;
    avatar_url?: string | null;
  } | null;
  onProposalCreated?: (contractId: string) => void;
}

export default function ProposalModal({
  isOpen,
  onClose,
  creator,
  onProposalCreated,
}: ProposalModalProps) {
  const [title, setTitle] = useState('');
  const [deliverableType, setDeliverableType] = useState('1x Instagram Reel');
  const [budget, setBudget] = useState<number | string>('');
  const [deadline, setDeadline] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [currentUser, setCurrentUser] = useState<{ display_name: string; email: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default budget and minimum deadline whenever the active creator changes
  useEffect(() => {
    if (creator) {
      setBudget(creator.starting_rate || 10000);
      setTitle(`Commercial Brief with ${creator.display_name}`);
      
      // Default deadline to 14 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setDeadline(defaultDate.toISOString().split('T')[0]);
    }
  }, [creator]);

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

  if (!isOpen || !creator) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a campaign title.');
      return;
    }

    const budgetValue = Number(budget);
    if (!budgetValue || budgetValue <= 0) {
      toast.error('Please enter a valid budget amount in INR.');
      return;
    }

    if (!deadline) {
      toast.error('Please select a valid deadline date.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Dispatching commercial proposal to ledger...');

    try {
      // 1. Submit proposal to create contract
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId: creator.id,
          title: title.trim(),
          deliverableType,
          budget: budgetValue,
          deadline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || 'Failed to submit proposal.';
        toast.error(errorMsg, { id: toastId });
        setIsSubmitting(false);
        return;
      }

      const contractId = data.contractId;

      // 2. Load Razorpay script
      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) {
        toast.success(`Brief delivered to ${creator.display_name}! (Fee pending)`, { id: toastId });
        if (onProposalCreated) {
          onProposalCreated(contractId);
        }
        onClose();
        setIsSubmitting(false);
        return;
      }

      // 3. Create Razorpay order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          feeType: 'PLATFORM_FEE',
          currency,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.success(`Proposal recorded. Platform fee can be settled from Agency Desk.`, { id: toastId });
        if (onProposalCreated) {
          onProposalCreated(contractId);
        }
        onClose();
        setIsSubmitting(false);
        return;
      }

      toast.dismiss(toastId);

      // 4. Open Razorpay Checkout Modal
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
                contractId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              toast.success('Payment verified! Brief delivered to creator desk.', { id: verifyToast });
              if (onProposalCreated) {
                onProposalCreated(contractId);
              }
              onClose();
            } else {
              toast.error(verifyData?.error || 'Payment signature verification failed.', { id: verifyToast });
            }
          } catch {
            toast.error('Network error during verification', { id: verifyToast });
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Brief recorded. Convenience fee remains pending.');
            if (onProposalCreated) {
              onProposalCreated(contractId);
            }
            onClose();
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error sending proposal.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white border border-ledger rounded-md p-6 sm:p-8 shadow-2xl text-ink"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-ledger">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-seal-light border border-seal/30 text-seal text-[10px] font-mono uppercase tracking-widest font-semibold mb-2">
              <ShieldCheck className="w-3 h-3" />
              <span>Commercial Brief Protocol</span>
            </div>
            <h2 className="text-xl font-bold font-display tracking-tight text-ink">
              Issue Commercial Brief
            </h2>
            <p className="text-xs font-mono text-ink-muted mt-1">
              Proposing terms to <strong className="text-ink">{creator.display_name}</strong> (@{creator.handle.replace(/^@/, '')})
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded text-ink-muted hover:text-ink hover:bg-paper transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Campaign Title */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold">
              Campaign / Brief Title
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Brand Launch Collaboration"
              className="w-full px-3.5 py-2.5 bg-paper border border-ledger rounded-md text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition text-xs font-mono disabled:opacity-50"
            />
          </div>

          {/* Deliverable Type */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-seal" />
              Deliverable Scope Specification
            </label>
            <select
              disabled={isSubmitting}
              value={deliverableType}
              onChange={(e) => setDeliverableType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-paper border border-ledger rounded-md text-ink focus:outline-none focus:border-ink transition text-xs font-mono disabled:opacity-50"
            >
              <option value="1x Instagram Reel">1x Instagram Reel</option>
              <option value="2x Instagram Stories">2x Instagram Stories</option>
              <option value="1x Dedicated Video">1x Dedicated Video</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-seal" />
              Agreed Gross Consideration (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs font-bold font-mono">
                ₹
              </span>
              <input
                type="number"
                min="500"
                step="500"
                required
                disabled={isSubmitting}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="25000"
                className="w-full pl-8 pr-3.5 py-2.5 bg-paper border border-ledger rounded-md text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink transition text-xs font-mono disabled:opacity-50"
              />
            </div>
            <p className="text-[11px] font-mono text-ink-muted mt-1">
              Registered baseline tariff: ₹{creator.starting_rate.toLocaleString('en-IN')}. Zero creator deduction.
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-seal" />
              Stipulated Completion Deadline
            </label>
            <input
              type="date"
              required
              disabled={isSubmitting}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-paper border border-ledger rounded-md text-ink focus:outline-none focus:border-ink transition text-xs font-mono disabled:opacity-50"
            />
          </div>

          {/* International / Domestic Currency Selector */}
          <div className="p-3 bg-paper border border-ledger rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-ink-muted flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-seal" />
                <span>Statutory Fee Currency</span>
              </span>
              <span className="text-xs font-mono font-bold text-ink">
                {currency === 'INR' ? '₹499 INR' : currency === 'USD' ? '$6 USD' : '€6 EUR'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['INR', 'USD', 'EUR'] as const).map((curr) => {
                const isSelected = currency === curr;
                return (
                  <button
                    type="button"
                    key={curr}
                    disabled={isSubmitting}
                    onClick={() => setCurrency(curr)}
                    className={`py-1.5 px-3 rounded-md text-xs font-mono uppercase font-bold transition border flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-ink text-paper border-ink shadow-sm'
                        : 'bg-white text-ink-muted border-ledger hover:text-ink hover:border-ink'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                    <span>{curr === 'INR' ? '₹ INR' : curr === 'USD' ? '$ USD' : '€ EUR'}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-muted pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-seal flex-shrink-0" />
              <span>Includes cryptographic SHA-256 seal & automated GST tax invoice.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-ledger">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink border border-ledger rounded-md transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-bold text-paper bg-ink hover:bg-black rounded-md shadow-sm transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-seal" />
                  <span>Recording Brief...</span>
                </>
              ) : (
                <>
                  <span>Dispatch & Settle Fee</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
