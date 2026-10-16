'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Loader2, IndianRupee, Calendar, Layers, Send } from 'lucide-react';

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
    const toastId = toast.loading('Sending campaign proposal...');

    try {
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
        return;
      }

      toast.success(`Proposal sent to ${creator.display_name}!`, { id: toastId });

      if (onProposalCreated && data.contractId) {
        onProposalCreated(data.contractId);
      }

      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error sending proposal.';
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
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Send Campaign Proposal
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
              Budget (INR)
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
              Defaulted to creator's base rate of ₹{creator.starting_rate.toLocaleString('en-IN')}. Platform fee: ₹499.
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
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
