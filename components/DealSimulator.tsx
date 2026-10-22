"use client";

import { useState } from "react";
import { Calculator, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function DealSimulator() {
  const [budget, setBudget] = useState<number>(75000);
  const [advancePercent, setAdvancePercent] = useState<number>(50);
  const [deliverablesCount, setDeliverablesCount] = useState<number>(2);
  const [creatorTier, setCreatorTier] = useState<"basic" | "pro" | "influencer">("pro");
  const [error, setError] = useState<string | null>(null);

  const handleBudgetChange = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) {
      setError("Please enter a valid numeric budget");
      return;
    }
    if (num < 5000) {
      setError("Minimum contract threshold is ₹5,000");
    } else if (num > 5000000) {
      setError("For budgets exceeding ₹50,00,000, please contact Enterprise desk");
    } else {
      setError(null);
    }
    setBudget(num);
  };

  const advanceAmount = Math.round((budget * advancePercent) / 100);
  const finalAmount = budget - advanceAmount;
  const gstAmount = Math.round(budget * 0.18);
  const totalWithGst = budget + gstAmount;

  // Platform escrow fee: 1.5% for basic, 1% for pro, 0% for influencer
  const escrowFeeRate = creatorTier === "influencer" ? 0 : creatorTier === "pro" ? 0.01 : 0.015;
  const escrowFee = Math.round(budget * escrowFeeRate);

  return (
    <div id="simulator" className="rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 lg:p-10 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-gold" />
            <span className="font-mono text-xs uppercase tracking-wider text-brand-gold">
              Live Escrow Simulator
            </span>
          </div>
          <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink-primary">
            Calculate Deal Settlement &amp; Milestone Vault
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            Test milestone release dynamics, GST calculations, and escrow safety rules.
          </p>
        </div>

        {/* Creator tier switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-elevated p-1 text-xs">
          <button
            onClick={() => setCreatorTier("basic")}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              creatorTier === "basic"
                ? "bg-surface-overlay text-ink-primary border border-border-subtle"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            Basic Creator
          </button>
          <button
            onClick={() => setCreatorTier("pro")}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              creatorTier === "pro"
                ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/30"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            Pro (₹999/mo)
          </button>
          <button
            onClick={() => setCreatorTier("influencer")}
            className={`rounded px-3 py-1.5 font-medium transition-colors ${
              creatorTier === "influencer"
                ? "bg-brand-gold text-black font-semibold"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            Influencer
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-6 lg:col-span-6">
          {/* Budget input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="budget-input" className="font-medium text-ink-secondary">
                Total Deal Amount (INR)
              </label>
              <span className="font-mono text-brand-gold font-semibold">
                ₹{budget.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-ink-muted">
                ₹
              </span>
              <input
                id="budget-input"
                type="number"
                min="5000"
                max="5000000"
                step="5000"
                value={budget || ""}
                onChange={(e) => handleBudgetChange(e.target.value)}
                className={`w-full rounded-lg border bg-surface-elevated py-2.5 pl-8 pr-4 font-mono text-sm text-ink-primary focus:outline-none focus:ring-1 ${
                  error
                    ? "border-status-error focus:ring-status-error"
                    : "border-border-subtle focus:border-brand-gold focus:ring-brand-gold"
                }`}
              />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-status-error">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Advance Escrow Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-ink-secondary">Advance Locked in Escrow</label>
              <span className="font-mono text-ink-primary font-semibold">{advancePercent}%</span>
            </div>
            <div className="flex items-center gap-3">
              {[30, 50, 70, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setAdvancePercent(pct)}
                  className={`flex-1 rounded-md border py-1.5 text-xs font-mono font-medium transition-colors ${
                    advancePercent === pct
                      ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                      : "border-border-subtle bg-surface-elevated text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Deliverables Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-ink-secondary">Scope: Deliverable Milestones</label>
              <span className="font-mono text-ink-primary font-semibold">{deliverablesCount} Items</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setDeliverablesCount(cnt)}
                  className={`rounded-md border py-1.5 text-xs font-mono font-medium transition-colors ${
                    deliverablesCount === cnt
                      ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                      : "border-border-subtle bg-surface-elevated text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {cnt} {cnt === 1 ? "Item" : "Items"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-elevated/50 p-4 text-xs text-ink-muted">
            <div className="flex items-center gap-2 text-ink-primary font-medium mb-1">
              <ShieldCheck className="h-4 w-4 text-brand-gold" />
              <span>Escrow Protection Logic</span>
            </div>
            <p>
              Agency locks advance funds upon contract signing. Creator completes deliverables without chasing payments. Payout triggers automatically within 5 seconds of deliverable approval.
            </p>
          </div>
        </div>

        {/* Ledger Breakdown Card */}
        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-6 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                Contract Ledger Summary
              </span>
              <span className="rounded bg-status-success/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-status-success">
                Aadhaar e-Sign Ready
              </span>
            </div>

            <div className="mt-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">1. Advance Escrow Lock ({advancePercent}%)</span>
                <span className="font-semibold text-ink-primary">
                  ₹{advanceAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">2. Settlement on Approval ({100 - advancePercent}%)</span>
                <span className="font-semibold text-ink-primary">
                  ₹{finalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">3. Applicable GST (18% B2B)</span>
                <span className="text-ink-muted">₹{gstAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary">4. CreateKar Escrow Fee ({escrowFeeRate * 100}%)</span>
                <span className={escrowFee === 0 ? "text-status-success font-semibold" : "text-ink-muted"}>
                  {escrowFee === 0 ? "₹0 (Waived for Influencers)" : `₹${escrowFee.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-sm">
                <span className="font-sans font-bold text-ink-primary">Total Contract Value</span>
                <span className="font-bold text-brand-gold text-base">
                  ₹{totalWithGst.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded border border-border-subtle bg-background p-3 text-[11px] text-ink-muted space-y-1">
              <div className="flex items-center gap-1.5 text-ink-primary font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-gold" />
                <span>GST Tax Invoice Type:</span>
              </div>
              <p>
                {creatorTier === "influencer"
                  ? "Clean White-Labeled GST Invoice (No Watermark, 100% Agency Ready)"
                  : "GST Tax Invoice Generated with 'Powered by CreateKar' Watermark"}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle">
            <Link
              href="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold py-3 text-sm font-semibold text-black transition-transform hover:bg-brand-gold-light active:scale-95"
            >
              <span>Draft This Contract in Deal Room</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
