"use client";

import { useState, useEffect } from "react";
import { CreatorNav } from "@/components/CreatorNav";
import {
  FileText,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Award,
  Wallet,
  Building2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "contracts" | "deliveries" | "invoices" | "payments" | "plan"
  >("overview");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [contracts, setContracts] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any>({ transactions: [], payoutDetails: {} });

  // Modals state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<any>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Bank & UPI edit state
  const [editUpiId, setEditUpiId] = useState("");
  const [editBankAccount, setEditBankAccount] = useState("");
  const [editIfsc, setEditIfsc] = useState("");
  const [savingBank, setSavingBank] = useState(false);

  // Invoice viewer modal
  const [viewInvoice, setViewInvoice] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [overviewRes, contractsRes, delivRes, invRes, payoutsRes] = await Promise.all([
        fetch("/api/creator/overview").then((r) => r.json()),
        fetch("/api/creator/contracts").then((r) => r.json()),
        fetch("/api/creator/deliverables").then((r) => r.json()),
        fetch("/api/creator/invoices").then((r) => r.json()),
        fetch("/api/creator/payouts").then((r) => r.json()),
      ]);

      if (overviewRes.success) {
        setProfile(overviewRes.profile || {});
        setStats(overviewRes.stats || {});
      }
      if (contractsRes.success) {
        setContracts(contractsRes.contracts || []);
      }
      if (delivRes.success) {
        setDeliverables(delivRes.deliverables || []);
      }
      if (invRes.success) {
        setInvoices(invRes.invoices || []);
      }
      if (payoutsRes.success) {
        setPayouts(payoutsRes);
        setEditUpiId(payoutsRes.payoutDetails?.upi_id || "");
        setEditBankAccount(payoutsRes.payoutDetails?.bank_account_number || "");
        setEditIfsc(payoutsRes.payoutDetails?.bank_ifsc || "");
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      toast.error("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Accept / Sign Contract Handler
  const handleAcceptContract = async (contractId: string) => {
    try {
      const res = await fetch(`/api/creator/contracts/${contractId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to accept contract");
        return;
      }
      toast.success("Contract signed with SHA-256 seal!");
      loadData();
    } catch {
      toast.error("Network error signing contract");
    }
  };

  // 2. Submit Deliverable Link Handler
  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl || !submissionUrl.trim().startsWith("http")) {
      toast.error("Please enter a valid URL (YouTube, Drive, Loom, Instagram)");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/creator/deliverables/${selectedDeliverable.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionUrl: submissionUrl.trim(),
          submissionNotes: submissionNotes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit deliverable");
        setSubmitting(false);
        return;
      }
      toast.success("Deliverable submitted! Agency notified.");
      setSubmitModalOpen(false);
      setSubmissionUrl("");
      setSubmissionNotes("");
      loadData();
    } catch {
      toast.error("Network error submitting deliverable");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Save Payout & UPI details
  const handleSavePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      const res = await fetch("/api/creator/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upiId: editUpiId.trim(),
          bankAccountNumber: editBankAccount.trim(),
          bankIfsc: editIfsc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update payout details");
        setSavingBank(false);
        return;
      }
      toast.success("Payout and UPI details saved!");
      loadData();
    } catch {
      toast.error("Network error updating payout details");
    } finally {
      setSavingBank(false);
    }
  };

  // 4. Confirm Direct P2P Payment
  const handleConfirmP2p = async (contractId: string, transactionId: string) => {
    try {
      const res = await fetch("/api/creator/p2p-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, transactionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to confirm payment");
        return;
      }
      toast.success("Payment confirmed! Contract marked complete.");
      loadData();
    } catch {
      toast.error("Network error confirming payment");
    }
  };

  // 5. Generate WhatsApp Due Reminder Link
  const getWhatsAppReminderUrl = (agencyName: string, contractNumber: string, amount: number) => {
    const text = encodeURIComponent(
      `Hi ${agencyName}, this is a gentle reminder regarding CreateKar campaign ${contractNumber} for ₹${amount.toLocaleString(
        "en-IN"
      )}. Content deliverable has been submitted for review. Please check the dashboard: https://createkar.com/agency/dashboard. Thank you!`
    );
    return `https://wa.me/?text=${text}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center text-xs text-ink-muted">
        Loading creator dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background" data-ui="app-screen">
      <CreatorNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        creatorName={profile.name || "Creator"}
        badgeType={profile.badge_type || "none"}
        planTier={profile.plan_tier || "basic"}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top Metric Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                <span className="text-xs text-ink-muted">Active Deals</span>
                <div className="text-2xl font-bold tabular-nums text-white">
                  {stats.active_deals || 0}
                </div>
                <span className="text-[11px] text-ink-secondary">In progress or review</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                <span className="text-xs text-ink-muted">Escrow Locked</span>
                <div className="text-2xl font-bold tabular-nums text-[#FF5B00]">
                  ₹{Number(stats.locked_escrow_inr || 0).toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-ink-secondary">Held in safe nodal bank</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                <span className="text-xs text-ink-muted">Deliverables Due</span>
                <div className="text-2xl font-bold tabular-nums text-white">
                  {stats.pending_submissions || 0}
                </div>
                <span className="text-[11px] text-ink-secondary">
                  {stats.revision_requests > 0
                    ? `${stats.revision_requests} revision request`
                    : "On schedule"}
                </span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                <span className="text-xs text-ink-muted">Total Earnings</span>
                <div className="text-2xl font-bold tabular-nums text-emerald-400">
                  ₹{Number(stats.total_earnings_inr || 0).toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-ink-secondary">Paid out to bank</span>
              </div>
            </div>

            {/* Plan Tier Status Banner */}
            <div className="rounded-xl border border-border-strong bg-surface-elevated p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-white">
                    Plan: {profile.plan_tier || "basic"}
                  </span>
                  {profile.badge_type === "verified" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                      <Award className="h-3 w-3" />
                      <span>Verified Creator Badge</span>
                    </span>
                  )}
                  {profile.badge_type === "famous" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded">
                      <Award className="h-3 w-3" />
                      <span>Famous Creator Badge</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-secondary">
                  {profile.freeContractsRemaining > 0
                    ? `${profile.freeContractsRemaining} of 5 free contracts remaining (₹199 per contract after).`
                    : "Free contracts used. Additional contracts billed at ₹199 per creation."}{" "}
                  {profile.isBoostActive ? (
                    <span className="text-emerald-400 font-medium">
                      Explore Roster Boost active!
                    </span>
                  ) : (
                    <span className="text-ink-muted">7-Day trial boost inactive.</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("plan")}
                  className="rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                >
                  Manage Plan &amp; Boost
                </button>
              </div>
            </div>

            {/* Actionable Contracts Pipeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Active Contracts &amp; Proposals</h3>
                <button
                  onClick={() => setActiveTab("contracts")}
                  className="text-xs text-[#FF5B00] hover:underline"
                >
                  View all contracts ({contracts.length})
                </button>
              </div>

              {contracts.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                  No active contracts. When brands propose a campaign, it will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {contracts.slice(0, 3).map((contract) => (
                    <div
                      key={contract.id}
                      className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] text-ink-muted">
                            {contract.contract_number}
                          </code>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              contract.status === "PROPOSED"
                                ? "bg-amber-400/10 text-amber-300"
                                : contract.status === "IN_REVIEW"
                                ? "bg-blue-400/10 text-blue-300"
                                : contract.status === "COMPLETED"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-surface-elevated text-ink-secondary"
                            }`}
                          >
                            {contract.status}
                          </span>
                          <span className="text-[10px] text-ink-muted">
                            {contract.payment_mode === "ESCROW_RAZORPAY"
                              ? "Escrow Vault"
                              : "Direct P2P"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{contract.title}</h4>
                        <p className="text-xs text-ink-secondary line-clamp-1">
                          {contract.campaign_brief}
                        </p>
                      </div>

                      <div data-ui="divider" className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-border-subtle/50 pt-3 md:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] text-ink-muted block">Deal Value</span>
                          <span className="text-sm font-bold tabular-nums text-white">
                            ₹{Number(contract.gross_amount_inr).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {contract.status === "PROPOSED" ? (
                          <button
                            onClick={() => handleAcceptContract(contract.id)}
                            className="rounded-lg bg-[#FF5B00] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                          >
                            Accept &amp; Sign
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab("deliveries")}
                            className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-semibold text-ink-secondary hover:text-white transition-colors"
                          >
                            Deliverables
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CONTRACTS (3.1) */}
        {/* ======================================================== */}
        {activeTab === "contracts" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Campaign Contracts</h2>
              <p className="text-xs text-ink-secondary mt-1">
                All agreements sealed with SHA-256 cryptographic verification and statutory terms.
              </p>
            </div>

            <div className="space-y-4">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-border-strong bg-surface p-6 space-y-4"
                >
                  <div data-ui="divider" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-[#FF5B00] font-semibold">
                          {c.contract_number}
                        </code>
                        <span className="text-xs text-ink-muted">• {c.company_name}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{c.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-white">
                        Status: {c.status}
                      </span>
                      {c.status === "PROPOSED" && (
                        <button
                          onClick={() => handleAcceptContract(c.id)}
                          className="rounded-lg bg-[#FF5B00] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                        >
                          Sign Contract (SHA-256)
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-ink-secondary leading-relaxed">{c.campaign_brief}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                    <div>
                      <span className="text-ink-muted block text-[11px]">Gross Amount</span>
                      <span className="font-semibold tabular-nums text-white">
                        ₹{Number(c.gross_amount_inr).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Advance (Escrow)</span>
                      <span className="font-semibold tabular-nums text-[#FF5B00]">
                        ₹{Number(c.advance_amount_inr).toLocaleString("en-IN")} ({c.advance_percent}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">TDS Withheld</span>
                      <span className="font-semibold tabular-nums text-ink-secondary">
                        {c.tds_section !== "NONE" ? `₹${c.tds_amount_inr} (${c.tds_section})` : "₹0 (Exempt)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-muted block text-[11px]">Payment Mode</span>
                      <span className="font-semibold text-white">
                        {c.payment_mode === "ESCROW_RAZORPAY" ? "Razorpay Nodal Escrow" : "Direct UPI / P2P"}
                      </span>
                    </div>
                  </div>

                  {c.sha256_digest && (
                    <code className="block rounded border border-border-subtle bg-surface-elevated/40 p-2.5 flex items-center justify-between text-[11px] text-ink-muted">
                      <span className="truncate max-w-md">SHA-256: {c.sha256_digest}</span>
                      <span className="text-emerald-400 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="h-3 w-3" /> Sealed
                      </span>
                    </code>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DELIVERABLES (3.3) */}
        {/* ======================================================== */}
        {activeTab === "deliveries" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Deliverable Submission Portal</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Upload your video drafts, unlisted YouTube links, or Drive folders for agency review.
              </p>
            </div>

            <div className="space-y-4">
              {deliverables.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                  No deliverables scheduled yet.
                </div>
              ) : (
                deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            d.status === "APPROVED"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : d.status === "SUBMITTED"
                              ? "bg-blue-400/10 text-blue-300"
                              : d.status === "REVISION_REQUESTED"
                              ? "bg-amber-400/10 text-amber-300"
                              : "bg-surface-elevated text-ink-muted"
                          }`}
                        >
                          {d.status}
                        </span>
                        <span className="text-xs font-bold text-white">{d.type}</span>
                        <span className="text-xs text-ink-muted">• {d.contract_number}</span>
                      </div>
                      <p className="text-xs text-ink-secondary">{d.description}</p>

                      {d.submission_url && (
                        <div className="flex items-center gap-2 text-xs text-[#FF5B00]">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <a
                            href={d.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline truncate max-w-md"
                          >
                            {d.submission_url}
                          </a>
                        </div>
                      )}

                      {d.revision_notes && (
                        <div className="rounded bg-amber-400/10 border border-amber-400/20 p-2.5 text-xs text-amber-200 space-y-1">
                          <span className="font-semibold block">Revision Feedback from Agency:</span>
                          <p>{d.revision_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {d.status !== "APPROVED" && (
                        <button
                          onClick={() => {
                            setSelectedDeliverable(d);
                            setSubmissionUrl(d.submission_url || "");
                            setSubmissionNotes(d.submission_notes || "");
                            setSubmitModalOpen(true);
                          }}
                          className="rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                        >
                          {d.status === "SUBMITTED" ? "Update Draft Link" : "Submit Draft Link"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: INVOICES (3.2) */}
        {/* ======================================================== */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">GST Invoices</h2>
                <p className="text-xs text-ink-secondary mt-1">
                  Automated B2B tax invoices generated upon milestone release.
                </p>
              </div>

              {/* Watermark Rule Indicator */}
              <div className="rounded-lg border border-border-strong bg-surface-elevated px-3 py-1.5 text-xs text-ink-muted">
                {profile.plan_tier === "influencer" ? (
                  <span className="text-amber-300 font-medium">
                    Influencer Plan: Watermark-free clean GST Invoices
                  </span>
                ) : (
                  <span>
                    Invoices carry &quot;Powered by CreateKar&quot; watermark. (Influencer removes watermark).
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                  No invoices generated yet. Invoices generate automatically when campaign milestones are completed.
                </div>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-bold text-[#FF5B00]">
                          {inv.invoice_number}
                        </code>
                        <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          {inv.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{inv.company_name}</h4>
                      <p className="text-[11px] text-ink-muted">
                        Contract: {inv.contract_title} ({inv.contract_number})
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <span className="text-[10px] text-ink-muted block">Total (with GST)</span>
                        <span className="text-sm font-bold tabular-nums text-white">
                          ₹{Number(inv.total_inr).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => setViewInvoice(inv)}
                        className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
                      >
                        View Invoice
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: PAYMENTS & ESCROW (3.4) */}
        {/* ======================================================== */}
        {activeTab === "payments" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white">Payments &amp; Escrow Ledger</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Manage your payout accounts, escrow balance releases, and 1-click WhatsApp reminders.
              </p>
            </div>

            {/* Payout Details Settings Card */}
            <div className="rounded-xl border border-border-strong bg-surface p-6 space-y-4">
              <div data-ui="divider" className="flex items-center gap-2 text-white font-semibold text-sm border-b border-border-subtle pb-3">
                <Wallet className="h-4 w-4 text-[#FF5B00]" />
                <span>Your Payout Accounts (UPI &amp; Bank Transfer)</span>
              </div>

              <form onSubmit={handleSavePayoutDetails} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">UPI ID (VPA)</label>
                  <input
                    type="text"
                    placeholder="yourhandle@okhdfcbank"
                    value={editUpiId}
                    onChange={(e) => setEditUpiId(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Bank Account Number</label>
                  <input
                    type="text"
                    placeholder="50100123456789"
                    value={editBankAccount}
                    onChange={(e) => setEditBankAccount(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Bank IFSC Code</label>
                  <input
                    type="text"
                    placeholder="HDFC0001234"
                    value={editIfsc}
                    onChange={(e) => setEditIfsc(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none uppercase"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingBank}
                    className="rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors disabled:opacity-50"
                  >
                    {savingBank ? "Saving..." : "Save Payout Details"}
                  </button>
                </div>
              </form>
            </div>

            {/* 1-Click WhatsApp Reminders */}
            <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>1-Click Automated WhatsApp Payment Reminders</span>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Send professional, pre-composed follow-up messages directly on WhatsApp without feeling awkward about asking for dues.
              </p>

              <div className="space-y-3 pt-2">
                {contracts
                  .filter((c) => c.status === "IN_REVIEW" || c.status === "FUNDED")
                  .map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-border-subtle bg-surface-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{c.title}</span>
                        <span className="text-ink-muted">
                          Agency: {c.company_name} • Pending Balance: ₹
                          {Number(c.balance_amount_inr).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <a
                        href={getWhatsAppReminderUrl(c.company_name, c.contract_number, c.balance_amount_inr)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 font-semibold text-white transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Send WhatsApp Reminder</span>
                      </a>
                    </div>
                  ))}
              </div>
            </div>

            {/* Transaction Ledger */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Transaction History</h3>

              <div className="space-y-3">
                {payouts.transactions?.length === 0 ? (
                  <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                    No transactions recorded yet.
                  </div>
                ) : (
                  payouts.transactions?.map((pt: any) => (
                    <div
                      key={pt.id}
                      className="rounded-xl border border-border-subtle bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{pt.contract_title}</span>
                          <span className="rounded bg-surface-elevated px-2 py-0.5 text-[10px] text-ink-muted">
                            {pt.payment_mode === "ESCROW_RAZORPAY" ? "Escrow Vault" : "Direct P2P"}
                          </span>
                        </div>
                        <span className="text-ink-muted block text-[11px]">
                          {pt.p2p_utr_number ? `UTR: ${pt.p2p_utr_number}` : `Order: ${pt.razorpay_order_id}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold tabular-nums text-emerald-400 text-sm">
                          +₹{Number(pt.amount_inr).toLocaleString("en-IN")}
                        </span>

                        {pt.payment_mode === "DIRECT_P2P" && pt.status === "PENDING" && (
                          <button
                            onClick={() => handleConfirmP2p(pt.contract_id, pt.id)}
                            className="rounded bg-emerald-500 hover:bg-emerald-600 px-3 py-1 font-semibold text-white text-xs transition-colors"
                          >
                            Confirm Received
                          </button>
                        )}
                        <span className="text-[11px] text-ink-muted font-medium capitalize">
                          {pt.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: PLAN & BOOST (Monetization) */}
        {/* ======================================================== */}
        {activeTab === "plan" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white">Monetization &amp; Boost Settings</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Manage your membership tier, explore directory boosts, and contract credits.
              </p>
            </div>

            {/* Current Active Plan Card */}
            <div className="rounded-xl border border-border-strong bg-surface p-6 space-y-4">
              <div data-ui="divider" className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <span className="text-xs text-ink-muted uppercase">Current Plan</span>
                  <h3 className="text-2xl font-bold text-white capitalize mt-0.5">
                    Creator {profile.plan_tier || "basic"}
                  </h3>
                </div>
                <div>
                  {profile.plan_tier === "basic" && (
                    <span className="rounded bg-surface-elevated px-3 py-1 text-xs font-semibold text-ink-secondary">
                      ₹0 / month
                    </span>
                  )}
                  {profile.plan_tier === "pro" && (
                    <span className="rounded bg-[#FF5B00]/15 border border-[#FF5B00]/30 px-3 py-1 text-xs font-semibold text-[#FF5B00]">
                      ₹999 / month
                    </span>
                  )}
                  {profile.plan_tier === "influencer" && (
                    <span className="rounded bg-amber-400/15 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300">
                      ₹4,999 / month
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-lg border border-border-subtle bg-surface-elevated p-4 space-y-1">
                  <span className="text-ink-muted">Contract Creation Limit</span>
                  <div className="text-base font-bold text-white">
                    {profile.freeContractsRemaining > 0
                      ? `${profile.freeContractsRemaining} of 5 free contracts left`
                      : "Pay ₹199 per contract"}
                  </div>
                  <span className="text-[11px] text-ink-muted">
                    Basic includes 5 free contracts. Pro includes 10 free. Influencer is unlimited.
                  </span>
                </div>

                <div className="rounded-lg border border-border-subtle bg-surface-elevated p-4 space-y-1">
                  <span className="text-ink-muted">Explore Directory Boost</span>
                  <div className="text-base font-bold text-white">
                    {profile.isBoostActive ? (
                      <span className="text-emerald-400">Boost Active</span>
                    ) : (
                      "Boost Expired"
                    )}
                  </div>
                  <span className="text-[11px] text-ink-muted">
                    Boost your profile to the top of the agency directory for 7 days (₹599).
                  </span>
                </div>

                <div className="rounded-lg border border-border-subtle bg-surface-elevated p-4 space-y-1">
                  <span className="text-ink-muted">GST Invoice Watermark</span>
                  <div className="text-base font-bold text-white">
                    {profile.plan_tier === "influencer" ? "No Watermark" : "CreateKar Watermark"}
                  </div>
                  <span className="text-[11px] text-ink-muted">
                    Influencer plan generates 100% white-labeled tax invoices.
                  </span>
                </div>
              </div>
            </div>

            {/* Upgrade Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Creator Pro */}
              <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-[#FF5B00]">Recommended</span>
                  <h4 className="text-lg font-bold text-white">Creator Pro</h4>
                  <div className="text-2xl font-bold tabular-nums text-white">
                    ₹999 <span className="text-xs text-ink-muted font-normal">/ month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-ink-secondary pt-2">
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-[#FF5B00] shrink-0" />
                      <span>&quot;Verified Creator&quot; Badge on profile</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#FF5B00] shrink-0" />
                      <span>1-Click payment due reminders on WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#FF5B00] shrink-0" />
                      <span>1 Month explore directory boost for agencies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-[#FF5B00] shrink-0" />
                      <span>10 Free contracts with Aadhaar e-signs</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => toast.info("Payment gateway checkout integration in progress.")}
                  className="w-full rounded-lg bg-[#FF5B00] py-2.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                >
                  Upgrade to Pro (₹999/mo)
                </button>
              </div>

              {/* Influencer */}
              <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-amber-400">Famous Status</span>
                  <h4 className="text-lg font-bold text-white">Influencer Desk</h4>
                  <div className="text-2xl font-bold tabular-nums text-white">
                    ₹4,999 <span className="text-xs text-ink-muted font-normal">/ month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-ink-secondary pt-2">
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>&quot;Famous Creator&quot; Golden Badge</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>GST Invoices WITHOUT watermark</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Unlimited free contracts with Aadhaar e-signs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>ITR Filing assistance &amp; International visibility</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => toast.info("Payment gateway checkout integration in progress.")}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
                >
                  Join Influencer Tier (₹4,999/mo)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* SUBMIT DELIVERABLE MODAL */}
      {/* ======================================================== */}
      {submitModalOpen && selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-ui="modal">
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <code className="text-xs text-[#FF5B00]">
                {selectedDeliverable.contract_number}
              </code>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Submit Deliverable Draft
              </h3>
              <p className="text-xs text-ink-secondary mt-1">
                {selectedDeliverable.type}: {selectedDeliverable.description}
              </p>
            </div>

            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-primary">
                  Draft Preview Link (YouTube unlisted, Drive, Loom, Instagram draft) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://youtu.be/... or https://drive.google.com/..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-primary">
                  Submission Notes / Timestamps (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Color graded, product showcased at 01:25, call to action at 02:45."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="rounded-lg border border-border-subtle px-4 py-2 text-xs font-medium text-ink-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#FF5B00] px-5 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Send to Agency for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORMAL GST INVOICE VIEWER MODAL */}
      {/* ======================================================== */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-ui="modal">
          <div className="w-full max-w-2xl rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Watermark Banner */}
            {viewInvoice.watermark_enabled && (
              <code className="block rounded bg-amber-400/10 border border-amber-400/20 p-2.5 text-xs text-amber-200 text-center">
                [ WATERMARK: Powered by CreateKar Sovereign Escrow ]
              </code>
            )}

            <div data-ui="divider" className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <code className="text-xs font-bold text-[#FF5B00]">TAX INVOICE</code>
                <h3 className="text-xl font-bold text-white mt-1">{viewInvoice.invoice_number}</h3>
                <p className="text-xs text-ink-muted">
                  Date: {new Date(viewInvoice.issued_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="font-semibold text-white block">SAC Code: 998361</span>
                <span className="text-ink-muted">Advertising &amp; Promotion Services</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-ink-muted block text-[11px] font-semibold">Billed By (Creator)</span>
                <p className="font-bold text-white">{profile.name}</p>
                <p className="text-ink-secondary">GSTIN: {profile.gstin || "Unregistered / Composition"}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-ink-muted block text-[11px] font-semibold">Billed To (Agency)</span>
                <p className="font-bold text-white">{viewInvoice.company_name}</p>
                <p className="text-ink-secondary">GSTIN: {viewInvoice.agency_gstin || "29AABCN5678F1Z1"}</p>
              </div>
            </div>

            {/* Line items */}
            <div data-ui="table-wrapper" className="border border-border-subtle rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-elevated text-ink-muted text-[11px]">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody data-ui="table-body" className="divide-y divide-border-subtle">
                  <tr>
                    <td className="p-3 text-white">
                      Creator Campaign Services ({viewInvoice.contract_title})
                    </td>
                    <td className="p-3 text-right tabular-nums text-white">
                      ₹{Number(viewInvoice.taxable_value_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ink-muted">CGST (9%)</td>
                    <td className="p-3 text-right tabular-nums text-ink-muted">
                      ₹{Number(viewInvoice.cgst_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ink-muted">SGST (9%)</td>
                    <td className="p-3 text-right tabular-nums text-ink-muted">
                      ₹{Number(viewInvoice.sgst_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr className="bg-surface-elevated font-bold text-white">
                    <td className="p-3">Total Amount Payable</td>
                    <td className="p-3 text-right tabular-nums text-[#FF5B00]">
                      ₹{Number(viewInvoice.total_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-ink-muted">
                Status: {viewInvoice.status} • Payment settled via CreateKar Escrow
              </span>
              <button
                onClick={() => setViewInvoice(null)}
                className="rounded-lg bg-surface-elevated border border-border-subtle px-4 py-2 text-xs font-semibold text-white hover:border-[#FF5B00]"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
