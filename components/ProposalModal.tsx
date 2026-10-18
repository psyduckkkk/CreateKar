'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  X, 
  Loader2, 
  IndianRupee, 
  Calendar, 
  Layers, 
  Send,
  CreditCard,
  Globe,
  ShieldCheck,
  Check
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
      setTitle(`Collaboration with ${creator.display_name}`);
      
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
    const toastId = toast.loading('Sending campaign proposal & initializing checkout...');

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
        toast.success(`Proposal sent to ${creator.display_name}! (Payment pending)`, { id: toastId });
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
        toast.success(`Proposal sent! Convenience fee can be completed from your dashboard.`, { id: toastId });
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
        theme: { color: '#0F172A' },
        handler: async function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          const verifyToast = toast.loading('Verifying secure payment...');
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
              toast.success('Payment completed successfully! Proposal delivered.', { id: verifyToast });
              if (onProposalCreated) {
                onProposalCreated(contractId);
              }
              onClose();
            } else {
              toast.error(verifyData?.error || 'Payment signature verification failed.', { id: verifyToast });
            }
          } catch {
            toast.error('Network error verifying payment.', { id: verifyToast });
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Proposal delivered to creator inbox. Fee can be finalized anytime from the Agency Desk.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-400" />
              <span>Send Campaign Proposal</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Proposing terms to <span className="text-sky-400 font-medium">{creator.display_name}</span> ({creator.handle})
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Campaign Title */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
              Campaign Title
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Brand Launch Collaboration"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm disabled:opacity-50"
            />
          </div>

          {/* Deliverable Type */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Deliverable Type
            </label>
            <select
              disabled={isSubmitting}
              value={deliverableType}
              onChange={(e) => setDeliverableType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm disabled:opacity-50"
            >
              <option value="1x Instagram Reel">1x Instagram Reel</option>
              <option value="2x Instagram Stories">2x Instagram Stories</option>
              <option value="1x Dedicated Video">1x Dedicated Video</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
              Creator Budget (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
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
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Baseline rate: ₹{creator.starting_rate.toLocaleString('en-IN')}. Zero creator commission.
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Deliverable Deadline
            </label>
            <input
              type="date"
              required
              disabled={isSubmitting}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm disabled:opacity-50"
            />
          </div>

          {/* International / Domestic Currency Selector */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Convenience Fee Currency</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
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
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                    <span>{curr === 'INR' ? '₹ INR' : curr === 'USD' ? '$ USD' : '€ EUR'}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Flat fee covers digital execution and automated GST compliance.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-lg shadow-sky-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Send & Checkout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
