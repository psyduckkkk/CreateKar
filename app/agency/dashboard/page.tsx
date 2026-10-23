"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  FileCheck2,
  Video,
  Receipt,
  Settings,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Zap,
  ExternalLink,
  Lock,
  Send,
  MessageSquare,
  Users,
  Briefcase,
  HelpCircle,
  FileText,
  X
} from "lucide-react";
import { AgencyNav } from "@/components/AgencyNav";

export default function AgencyDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Agency data
  const [agencyProfile, setAgencyProfile] = useState<any>({});
  const [overviewMetrics, setOverviewMetrics] = useState<any>({});
  const [recentContracts, setRecentContracts] = useState<any[]>([]);

  // Explore Creators state
  const [creators, setCreators] = useState<any[]>([]);
  const [creatorSearch, setCreatorSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [creatorMeta, setCreatorMeta] = useState<any>({});

  // Contracts state
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContractForNegotiation, setSelectedContractForNegotiation] = useState<any | null>(null);
  const [negotiationsList, setNegotiationsList] = useState<any[]>([]);
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [counterGross, setCounterGross] = useState("");
  const [counterAdvance, setCounterAdvance] = useState("");

  // Deliverables state
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [revisionModalDeliverable, setRevisionModalDeliverable] = useState<any | null>(null);
  const [revisionNotesInput, setRevisionNotesInput] = useState("");

  // Invoices state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Propose Deal Modal state
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [selectedCreatorForDeal, setSelectedCreatorForDeal] = useState<any | null>(null);
  const [dealTitle, setDealTitle] = useState("");
  const [dealBrief, setDealBrief] = useState("");
  const [dealGrossAmount, setDealGrossAmount] = useState("50000");
  const [dealAdvancePercent, setDealAdvancePercent] = useState("50");
  const [dealPaymentMode, setDealPaymentMode] = useState("ESCROW_RAZORPAY");
  const [dealSignatureMethod, setDealSignatureMethod] = useState("SHA256_CRYPTOGRAPHIC");
  const [dealTdsSection, setDealTdsSection] = useState("194C_1PCT");
  const [dealDeliverableType, setDealDeliverableType] = useState("Dedicated YouTube Video");
  const [dealDeadlineDays, setDealDeadlineDays] = useState("14");
  const [dealInitialMessage, setDealInitialMessage] = useState("");

  // Settings form state
  const [settingsCompanyName, setSettingsCompanyName] = useState("");
  const [settingsBrandName, setSettingsBrandName] = useState("");
  const [settingsGstin, setSettingsGstin] = useState("");
  const [settingsTan, setSettingsTan] = useState("");
  const [settingsBillingAddress, setSettingsBillingAddress] = useState("");
  const [settingsPlanTier, setSettingsPlanTier] = useState("basic");

  // Feedback notifications
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showNotice = (type: "success" | "error", text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // 1. Initial Load
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ovRes, crRes, conRes, delRes, invRes] = await Promise.all([
        fetch("/api/agency/overview"),
        fetch("/api/agency/creators"),
        fetch("/api/agency/contracts"),
        fetch("/api/agency/deliverables"),
        fetch("/api/agency/invoices")
      ]);

      if (ovRes.status === 401) {
        router.push("/login?from=/agency/dashboard");
        return;
      }

      const ovData = await ovRes.json();
      const crData = await crRes.json();
      const conData = await conRes.json();
      const delData = await delRes.json();
      const invData = await invRes.json();

      if (ovData.agency) {
        setAgencyProfile(ovData.agency);
        setSettingsCompanyName(ovData.agency.company_name || "");
        setSettingsBrandName(ovData.agency.brand_name || "");
        setSettingsGstin(ovData.agency.gstin || "");
        setSettingsTan(ovData.agency.tan || "");
        setSettingsBillingAddress(ovData.agency.billing_address || "");
        setSettingsPlanTier(ovData.agency.plan_tier || "basic");
      }
      if (ovData.metrics) setOverviewMetrics(ovData.metrics);
      if (ovData.recentContracts) setRecentContracts(ovData.recentContracts);

      if (crData.creators) {
        setCreators(crData.creators);
        setCreatorMeta({
          tier: crData.tier,
          limitEnforced: crData.limitEnforced,
          totalMatching: crData.totalMatching,
          hasMore: crData.hasMore
        });
      }

      if (conData.contracts) setContracts(conData.contracts);
      if (delData.deliverables) setDeliverables(delData.deliverables);
      if (invData.invoices) setInvoices(invData.invoices);
    } catch (err) {
      console.error("Dashboard initial load failed:", err);
      showNotice("error", "Failed to load agency workspace. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter creators
  const handleSearchCreators = async (searchVal: string, nicheVal: string) => {
    try {
      const params = new URLSearchParams();
      if (searchVal) params.set("search", searchVal);
      if (nicheVal && nicheVal !== "All") params.set("niche", nicheVal);

      const res = await fetch(`/api/agency/creators?${params.toString()}`);
      const data = await res.json();
      if (data.creators) {
        setCreators(data.creators);
        setCreatorMeta({
          tier: data.tier,
          limitEnforced: data.limitEnforced,
          totalMatching: data.totalMatching,
          hasMore: data.hasMore
        });
      }
    } catch {
      showNotice("error", "Error searching creators.");
    }
  };

  // 4.2 Propose Deal Submit
  const handleProposeDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorForDeal) return;

    try {
      const deadline = new Date(Date.now() + Number(dealDeadlineDays) * 86400000).toISOString();
      const res = await fetch("/api/agency/contracts/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator_id: selectedCreatorForDeal.id,
          title: dealTitle,
          campaign_brief: dealBrief,
          gross_amount_inr: Number(dealGrossAmount),
          advance_percent: Number(dealAdvancePercent),
          payment_mode: dealPaymentMode,
          signature_method: dealSignatureMethod,
          tds_section: dealTdsSection,
          initial_message: dealInitialMessage,
          deliverables: [
            {
              type: dealDeliverableType,
              description: `Deliverable: ${dealTitle}`,
              deadline
            }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showNotice("error", data.error || "Failed to propose deal.");
        return;
      }

      showNotice("success", `Proposal ${data.contractNumber} submitted! Terms sealed with SHA-256 digest.`);
      setProposeModalOpen(false);
      setSelectedCreatorForDeal(null);
      setDealTitle("");
      setDealBrief("");
      setDealInitialMessage("");
      fetchDashboardData();
      setActiveTab("deals");
    } catch {
      showNotice("error", "Network error proposing contract.");
    }
  };

  // 4.3 Open Negotiation Thread
  const handleOpenNegotiations = async (contract: any) => {
    setSelectedContractForNegotiation(contract);
    setCounterGross(String(contract.gross_amount_inr));
    setCounterAdvance(String(contract.advance_percent));
    try {
      const res = await fetch(`/api/agency/contracts/${contract.id}/negotiations`);
      const data = await res.json();
      if (data.negotiations) {
        setNegotiationsList(data.negotiations);
      }
    } catch {
      showNotice("error", "Failed to load negotiation thread.");
    }
  };

  const handleSendNegotiationMessage = async (action: "REPLY" | "COUNTER_OFFER" | "ACCEPT_COUNTER") => {
    if (!selectedContractForNegotiation) return;
    try {
      const res = await fetch(`/api/agency/contracts/${selectedContractForNegotiation.id}/negotiations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: negotiationMessage || (action === "ACCEPT_COUNTER" ? "Terms accepted by agency." : "Updated offer proposed."),
          proposed_gross_amount_inr: action !== "REPLY" ? Number(counterGross) : undefined,
          proposed_advance_percent: action !== "REPLY" ? Number(counterAdvance) : undefined,
          action
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showNotice("error", data.error || "Failed to submit negotiation.");
        return;
      }

      showNotice("success", action === "ACCEPT_COUNTER" ? "Revised deal accepted and updated!" : "Negotiation note recorded.");
      setNegotiationMessage("");
      handleOpenNegotiations(selectedContractForNegotiation);
      fetchDashboardData();
    } catch {
      showNotice("error", "Error posting negotiation.");
    }
  };

  // 4.4 Lock Escrow Advance
  const handleLockEscrow = async (contractId: string) => {
    try {
      const res = await fetch(`/api/agency/contracts/${contractId}/lock-escrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice("error", data.error || "Failed to lock escrow.");
        return;
      }

      showNotice("success", data.message || "Escrow vault locked. Creator notified to start production!");
      fetchDashboardData();
    } catch {
      showNotice("error", "Error locking escrow.");
    }
  };

  // 4.5 Deliverable Review: Approve or Request Revision
  const handleApproveDeliverable = async (deliverableId: string) => {
    try {
      const res = await fetch(`/api/agency/deliverables/${deliverableId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice("error", data.error || "Failed to approve deliverable.");
        return;
      }

      showNotice("success", "Deliverable cut approved!");
      fetchDashboardData();
    } catch {
      showNotice("error", "Error approving deliverable.");
    }
  };

  const handleRequestRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionModalDeliverable || !revisionNotesInput.trim()) return;

    try {
      const res = await fetch(`/api/agency/deliverables/${revisionModalDeliverable.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_REVISION",
          revision_notes: revisionNotesInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice("error", data.error || "Failed to request revision.");
        return;
      }

      showNotice("success", "Revision requested. Creator has been notified.");
      setRevisionModalDeliverable(null);
      setRevisionNotesInput("");
      fetchDashboardData();
    } catch {
      showNotice("error", "Error submitting revision request.");
    }
  };

  // 4.5 & 4.6 Release Escrow Balance & Issue Invoice
  const handleReleaseEscrow = async (contractId: string) => {
    try {
      const res = await fetch(`/api/agency/contracts/${contractId}/release-escrow`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice("error", data.error || "Failed to release escrow.");
        return;
      }

      showNotice("success", data.message || "Escrow settled to creator. Tax invoice generated.");
      fetchDashboardData();
    } catch {
      showNotice("error", "Error releasing escrow.");
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/agency/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: settingsCompanyName,
          brand_name: settingsBrandName,
          gstin: settingsGstin,
          tan: settingsTan,
          billing_address: settingsBillingAddress,
          plan_tier: settingsPlanTier
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice("error", data.error || "Failed to update agency settings.");
        return;
      }

      showNotice("success", "Agency profile and tier updated successfully!");
      fetchDashboardData();
    } catch {
      showNotice("error", "Error updating settings.");
    }
  };

  // Calculate net preview for proposal form
  const calcProposalGross = Number(dealGrossAmount) || 0;
  const calcProposalAdvance = Math.round((calcProposalGross * (Number(dealAdvancePercent) || 50)) / 100);
  const calcProposalBalance = calcProposalGross - calcProposalAdvance;
  const calcTdsRate = dealTdsSection === "194C_1PCT" ? 0.01 : dealTdsSection === "194C_2PCT" || dealTdsSection === "194J_2PCT" ? 0.02 : dealTdsSection === "194J_10PCT" ? 0.1 : 0;
  const calcTdsDeduction = Math.round(calcProposalGross * calcTdsRate);
  const calcNetPayable = calcProposalGross - calcTdsDeduction;

  const niches = [
    "All",
    "Tech & AI",
    "Finance & Wealth",
    "Fitness & Nutrition",
    "Health & Medicine",
    "Automotive & EVs",
    "Beauty & Skincare",
    "Gaming & Esports",
    "Travel & Heritage",
    "Productivity & SaaS",
    "Sustainable Living"
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center text-xs text-ink-muted">
        Loading Agency Escrow Hub...
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background" data-ui="agency-app">
      <AgencyNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companyName={agencyProfile.company_name || "Agency Hub"}
        planTier={agencyProfile.plan_tier || "basic"}
      />

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div
          data-ui="toast"
          className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-xs font-semibold max-w-md ${
            actionNotice.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          {actionNotice.text}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top Metric Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                <span className="text-xs text-ink-muted font-medium">Active Campaigns</span>
                <div className="text-2xl font-bold tabular-nums text-white">
                  {overviewMetrics.activeContractsCount || 0}
                </div>
                <span className="text-[11px] text-ink-secondary">In progress or review</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                <span className="text-xs text-ink-muted font-medium">Escrow Vault Held</span>
                <div className="text-2xl font-bold tabular-nums text-[#1D62EA]">
                  ₹{(overviewMetrics.escrowVaultHeldInr || 0).toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-ink-secondary">Locked in Route Escrow</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                <span className="text-xs text-ink-muted font-medium">Pending Reviews</span>
                <div className="text-2xl font-bold tabular-nums text-[#FF5B00]">
                  {overviewMetrics.pendingDeliverableReviews || 0}
                </div>
                <span className="text-[11px] text-ink-secondary">Creator drafts to inspect</span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                <span className="text-xs text-ink-muted font-medium">Total Settled (GST)</span>
                <div className="text-2xl font-bold tabular-nums text-emerald-400">
                  ₹{(overviewMetrics.totalSettledInr || 0).toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-ink-secondary">
                  {overviewMetrics.settledInvoicesCount || 0} tax invoices settled
                </span>
              </div>
            </div>

            {/* Quick Actions & Tier Quota Banner */}
            <div className="rounded-xl border border-border-strong bg-surface-elevated p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-white">
                    Agency Tier: {agencyProfile.plan_tier || "basic"}
                  </span>
                  <span className="rounded bg-[#1D62EA]/15 text-[#1D62EA] text-[10px] font-bold px-2 py-0.5">
                    Limit: {agencyProfile.creator_search_limit || 5} Creators Visible
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Explore verified Indian creators, propose standardized escrow deals, and seal contracts under SHA-256 regulations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("explore")}
                  className="rounded-lg bg-[#1D62EA] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  Explore Creators
                </button>
                <button
                  onClick={() => {
                    setSelectedCreatorForDeal(null);
                    setProposeModalOpen(true);
                  }}
                  className="rounded-lg border border-border-subtle bg-surface px-4 py-2 text-xs font-semibold text-white hover:border-[#1D62EA] transition-colors"
                >
                  Propose New Deal
                </button>
              </div>
            </div>

            {/* Recent Campaigns Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Recent Campaign Deals</h3>
                <button
                  onClick={() => setActiveTab("deals")}
                  className="text-xs text-[#1D62EA] hover:underline"
                >
                  View all deals ({contracts.length})
                </button>
              </div>

              {recentContracts.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                  No campaigns initiated yet. Browse the creator directory to propose your first collaboration.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentContracts.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] text-ink-muted">{c.contract_number}</code>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              c.status === "PROPOSED"
                                ? "bg-amber-400/10 text-amber-300"
                                : c.status === "NEGOTIATION"
                                ? "bg-cyan-400/10 text-cyan-300"
                                : c.status === "FUNDED"
                                ? "bg-blue-400/10 text-blue-300"
                                : c.status === "IN_REVIEW"
                                ? "bg-sky-400/10 text-sky-300"
                                : c.status === "COMPLETED"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-surface-elevated text-ink-secondary"
                            }`}
                          >
                            {c.status}
                          </span>
                          <span className="text-[10px] text-ink-muted">
                            {c.payment_mode === "ESCROW_RAZORPAY" ? "Razorpay Route Escrow" : "Direct P2P"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      </div>

                      <div data-ui="divider" className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-border-subtle/50 pt-3 md:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] text-ink-muted block">Deal Value</span>
                          <span className="text-sm font-bold tabular-nums text-white">
                            ₹{Number(c.gross_amount_inr).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("deals");
                          }}
                          className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#1D62EA]"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: EXPLORE CREATORS (4.1) */}
        {/* ======================================================== */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Explore Verified Creators</h2>
                <p className="text-xs text-ink-secondary mt-1">
                  Discover vetted Indian creators with transparent base rates, follower telemetry, and priority boost placements.
                </p>
              </div>

              {/* Tier Limit Badge */}
              <div className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs flex items-center gap-2">
                <Users className="h-4 w-4 text-[#1D62EA]" />
                <span className="text-ink-secondary">
                  Showing <strong className="text-white">{creators.length}</strong> of{" "}
                  <strong className="text-white">{creatorMeta.totalMatching || creators.length}</strong> on{" "}
                  <span className="uppercase text-[#1D62EA] font-semibold">{creatorMeta.tier || "basic"}</span> plan
                </span>
              </div>
            </div>

            {/* Quota Upgrade Callout if Basic Plan */}
            {creatorMeta.tier === "basic" && creatorMeta.hasMore && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-blue-200">Basic Agency Limit: 5 Creators Visible</span>
                  <p className="text-blue-300/80">
                    Upgrade to Agency Pro (10 creators) or Enterprise (50 creators) to discover more creators and enable Aadhaar e-signs.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="rounded-lg bg-[#1D62EA] px-3.5 py-1.5 text-xs font-semibold text-white shrink-0 hover:bg-blue-600"
                >
                  Upgrade Roster Limit
                </button>
              </div>
            )}

            {/* Search & Niche Filter Bar */}
            <div className="rounded-xl border border-border-subtle bg-surface p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Search creator by name, niche, or bio keyword..."
                  value={creatorSearch}
                  onChange={(e) => {
                    setCreatorSearch(e.target.value);
                    handleSearchCreators(e.target.value, selectedNiche);
                  }}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated pl-10 pr-4 py-2.5 text-xs text-white placeholder-ink-muted focus:border-[#1D62EA] focus:outline-none"
                />
              </div>

              {/* Niche Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {niches.map((niche) => (
                  <button
                    key={niche}
                    onClick={() => {
                      setSelectedNiche(niche);
                      handleSearchCreators(creatorSearch, niche);
                    }}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      selectedNiche === niche
                        ? "bg-[#1D62EA] text-white"
                        : "bg-surface-elevated text-ink-secondary hover:text-white"
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            {/* Creator Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {creators.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col justify-between space-y-4 hover:border-border-strong transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{c.name}</h3>
                          {c.badge_type === "verified" && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                              <Award className="h-3 w-3" />
                              <span>Verified</span>
                            </span>
                          )}
                          {c.badge_type === "famous" && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded">
                              <Award className="h-3 w-3" />
                              <span>Famous</span>
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#1D62EA] font-medium block mt-0.5">
                          {c.niche || "Content Creator"}
                        </span>
                      </div>

                      {c.is_boosted && (
                        <span data-ui="badge" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF5B00] bg-[#FF5B00]/15 border border-[#FF5B00]/30 px-2 py-0.5 rounded-full shrink-0">
                          <Zap className="h-3 w-3 fill-[#FF5B00]" />
                          <span>Boosted</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
                      {c.bio || "Active content creator ready for branded collaborations and integrations."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="rounded bg-surface-elevated p-2">
                        <span className="text-[10px] text-ink-muted block">Followers</span>
                        <span className="font-bold tabular-nums text-white">
                          {Number(c.followers_count || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="rounded bg-surface-elevated p-2">
                        <span className="text-[10px] text-ink-muted block">Base Rate</span>
                        <span className="font-bold tabular-nums text-white">
                          ₹{Number(c.base_rate_inr || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {(c.instagram_handle || c.youtube_handle) && (
                      <div className="text-[11px] text-ink-muted flex items-center gap-3">
                        {c.instagram_handle && (
                          <span className="truncate">{c.instagram_handle}</span>
                        )}
                        {c.youtube_handle && (
                          <span className="truncate">{c.youtube_handle}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCreatorForDeal(c);
                      setDealGrossAmount(String(c.base_rate_inr || 50000));
                      setProposeModalOpen(true);
                    }}
                    className="w-full rounded-lg bg-[#1D62EA] py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                  >
                    Propose Campaign Deal
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DEALS & NEGOTIATIONS (4.2, 4.3, 4.4) */}
        {/* ======================================================== */}
        {activeTab === "deals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Campaign Deals &amp; Escrow Contracts</h2>
                <p className="text-xs text-ink-secondary mt-1">
                  Draft proposals, negotiate deliverables &amp; commercial terms, lock escrow advance, and execute SHA-256 seals.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCreatorForDeal(null);
                  setProposeModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-[#1D62EA] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Propose Campaign Deal</span>
              </button>
            </div>

            {/* Contracts List */}
            <div className="space-y-4">
              {contracts.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                  No active contracts. Explore creators to propose a campaign deal.
                </div>
              ) : (
                contracts.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border-strong bg-surface p-6 space-y-4"
                  >
                    <div data-ui="divider" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-[#1D62EA] font-semibold">{c.contract_number}</code>
                          <span className="text-xs text-white font-medium">• Creator: {c.creator_name}</span>
                          {c.creator_badge_type === "verified" && (
                            <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.2 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white mt-1">{c.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2.5 py-1 text-xs font-semibold ${
                            c.status === "PROPOSED"
                              ? "bg-amber-400/10 text-amber-300"
                              : c.status === "NEGOTIATION"
                              ? "bg-cyan-400/10 text-cyan-300"
                              : c.status === "FUNDED"
                              ? "bg-blue-400/10 text-blue-300"
                              : c.status === "IN_REVIEW"
                              ? "bg-sky-400/10 text-sky-300"
                              : c.status === "COMPLETED"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-surface-elevated text-white"
                          }`}
                        >
                          Status: {c.status}
                        </span>

                        {/* Lock Escrow Button if PROPOSED or ACCEPTED and not funded yet */}
                        {["PROPOSED", "NEGOTIATION", "ACCEPTED"].includes(c.status) && (
                          <button
                            onClick={() => handleLockEscrow(c.id)}
                            className="rounded-lg bg-[#FF5B00] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                          >
                            Lock Advance in Escrow (₹{Number(c.advance_amount_inr).toLocaleString("en-IN")})
                          </button>
                        )}

                        {/* Negotiation Chat Button */}
                        <button
                          onClick={() => handleOpenNegotiations(c)}
                          className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#1D62EA]"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Negotiation</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-ink-secondary leading-relaxed">{c.campaign_brief}</p>

                    {/* Commercial Terms Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs pt-2">
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
                        <span className="text-ink-muted block text-[11px]">Balance on Delivery</span>
                        <span className="font-semibold tabular-nums text-white">
                          ₹{Number(c.balance_amount_inr).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[11px]">TDS Deduction</span>
                        <span className="font-semibold tabular-nums text-ink-secondary">
                          {c.tds_section !== "NONE" ? `₹${c.tds_amount_inr} (${c.tds_section})` : "₹0 (Exempt)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-muted block text-[11px]">Settlement Mode</span>
                        <span className="font-semibold text-white">
                          {c.payment_mode === "ESCROW_RAZORPAY" ? "Razorpay Escrow Vault" : "Direct P2P UPI"}
                        </span>
                      </div>
                    </div>

                    {/* SHA-256 Seal Tag */}
                    {c.sha256_digest && (
                      <code className="block rounded border border-border-subtle bg-surface-elevated/40 p-2.5 flex items-center justify-between text-[11px] text-ink-muted">
                        <span className="truncate max-w-lg">SHA-256 Seal: {c.sha256_digest}</span>
                        <span className="text-emerald-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Legally Sealed (IT Act §10A)
                        </span>
                      </code>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: DELIVERABLE REVIEWS (4.5) */}
        {/* ======================================================== */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Deliverable Review &amp; Approval Portal</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Inspect creator drafts, review unlisted video previews, request revisions with specific timecodes, or approve and trigger escrow payouts.
              </p>
            </div>

            <div className="space-y-4">
              {deliverables.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                  No deliverables submitted by creators yet.
                </div>
              ) : (
                deliverables.map((del) => (
                  <div
                    key={del.id}
                    className="rounded-xl border border-border-subtle bg-surface p-6 space-y-4"
                  >
                    <div data-ui="divider" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-[#1D62EA] font-semibold">{del.contract_number}</code>
                          <span className="text-xs text-white font-medium">• Creator: {del.creator_name}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              del.status === "PENDING"
                                ? "bg-surface-elevated text-ink-muted"
                                : del.status === "SUBMITTED"
                                ? "bg-blue-400/10 text-blue-300"
                                : del.status === "REVISION_REQUESTED"
                                ? "bg-amber-400/10 text-amber-300"
                                : del.status === "APPROVED"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-surface-elevated text-ink-secondary"
                            }`}
                          >
                            {del.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1">{del.type}</h3>
                        <p className="text-xs text-ink-secondary mt-0.5">{del.description}</p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-ink-muted block text-[11px]">Due Date</span>
                        <span className="font-semibold text-white">
                          {new Date(del.deadline).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Submission URL Preview Card */}
                    {del.submission_url ? (
                      <div className="rounded-lg border border-border-subtle bg-surface-elevated p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">Creator Submission:</span>
                          <a
                            href={del.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D62EA] hover:underline"
                          >
                            <span>Open Draft Link</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <code className="block text-xs text-ink-secondary truncate bg-background p-2 rounded">
                          {del.submission_url}
                        </code>
                        {del.submission_notes && (
                          <p className="text-xs text-ink-secondary italic pt-1">
                            Notes from creator: &ldquo;{del.submission_notes}&rdquo;
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-surface-elevated p-4 text-xs text-ink-muted italic">
                        Creator has not submitted a draft for this milestone yet.
                      </div>
                    )}

                    {/* Previous revision notes if any */}
                    {del.revision_notes && (
                      <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-200">
                        <strong>Previous Revision Feedback:</strong> {del.revision_notes}
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-ink-muted">
                        Revision cycles: <strong className="text-white">{del.revision_count}</strong>
                      </div>

                      <div className="flex items-center gap-3">
                        {del.status === "SUBMITTED" && (
                          <>
                            <button
                              onClick={() => {
                                setRevisionModalDeliverable(del);
                                setRevisionNotesInput("");
                              }}
                              className="rounded-lg border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-amber-300 hover:border-amber-400"
                            >
                              Request Revision
                            </button>
                            <button
                              onClick={() => handleApproveDeliverable(del.id)}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                            >
                              Approve Deliverable
                            </button>
                          </>
                        )}

                        {del.status === "APPROVED" && (
                          <button
                            onClick={() => handleReleaseEscrow(del.contract_id)}
                            className="rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a]"
                          >
                            Release Escrow Payment (₹{Number(del.balance_amount_inr || del.gross_amount_inr).toLocaleString("en-IN")})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: B2B GST TAX INVOICES (4.6) */}
        {/* ======================================================== */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">B2B GST Tax Invoices</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Compliant statutory tax invoices with GSTIN validation, SAC Code 998311, and CBDT Section 194C/194J TDS schedules.
              </p>
            </div>

            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                  No tax invoices issued yet. Invoices generate automatically once campaign milestones and escrow releases are completed.
                </div>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-bold text-[#1D62EA]">
                          {inv.invoice_number}
                        </code>
                        <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          {inv.status}
                        </span>
                        {inv.watermark_enabled && (
                          <span className="rounded bg-surface-elevated text-ink-muted px-2 py-0.5 text-[10px]">
                            Watermarked
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-white">Creator: {inv.creator_name}</h4>
                      <p className="text-[11px] text-ink-muted">
                        Campaign: {inv.contract_title} ({inv.contract_number})
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <span className="text-[10px] text-ink-muted block">Settled with GST</span>
                        <span className="text-sm font-bold tabular-nums text-white">
                          ₹{Number(inv.total_inr).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#1D62EA]"
                      >
                        View Tax Invoice
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: COMPANY PROFILE */}
        {/* ======================================================== */}
        {activeTab === "profile" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white">Company &amp; Statutory Profile</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Manage your registered corporate entity, brand name, statutory GSTIN/TAN, authorized contact representative, and billing address.
              </p>
            </div>

            {/* Entity Details Form */}
            <form onSubmit={handleSaveSettings} className="rounded-xl border border-border-strong bg-surface p-6 space-y-6">
              <div data-ui="divider" className="flex items-center gap-2 text-white font-semibold text-sm border-b border-border-subtle pb-3">
                <Building2 className="h-4 w-4 text-[#1D62EA]" />
                <span>Statutory &amp; Invoicing Entity Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Legal Registered Company Name</label>
                  <input
                    type="text"
                    required
                    value={settingsCompanyName}
                    onChange={(e) => setSettingsCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Consumer Brand / Trade Name</label>
                  <input
                    type="text"
                    value={settingsBrandName}
                    onChange={(e) => setSettingsBrandName(e.target.value)}
                    placeholder="e.g. Zomato, Sugar Cosmetics"
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">GSTIN (15-digit Goods &amp; Services Tax ID)</label>
                  <input
                    type="text"
                    value={settingsGstin}
                    onChange={(e) => setSettingsGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 29AABCN5678F1Z1"
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">TAN (10-digit Tax Deduction Account Number)</label>
                  <input
                    type="text"
                    value={settingsTan}
                    onChange={(e) => setSettingsTan(e.target.value.toUpperCase())}
                    placeholder="e.g. BLRN12345D"
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Authorized Account Name</label>
                  <input
                    type="text"
                    disabled
                    value={agencyProfile.name || "Authorized Representative"}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated/50 px-3 py-2 text-xs text-ink-muted cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Official Registered Email</label>
                  <input
                    type="email"
                    disabled
                    value={agencyProfile.email || ""}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated/50 px-3 py-2 text-xs text-ink-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-primary">Registered Billing Address (Printed on Invoices)</label>
                <textarea
                  rows={2}
                  value={settingsBillingAddress}
                  onChange={(e) => setSettingsBillingAddress(e.target.value)}
                  placeholder="Complete office address as printed on GST certificate..."
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-ink-muted">
                  Current Tier: <span className="text-white font-semibold uppercase">{agencyProfile.plan_tier || "basic"}</span>
                </span>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1D62EA] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  Save Company Profile
                </button>
              </div>
            </form>

            {/* Quick Hub Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Active Deals</span>
                  <FileCheck2 className="h-4 w-4 text-[#1D62EA]" />
                </div>
                <p className="text-xs text-ink-secondary">Manage campaign contracts and deliverables.</p>
                <button
                  onClick={() => setActiveTab("deals")}
                  className="text-xs font-semibold text-[#1D62EA] hover:underline pt-1 inline-flex items-center gap-1"
                >
                  <span>Go to Deals</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Tax Invoices</span>
                  <Receipt className="h-4 w-4 text-[#1D62EA]" />
                </div>
                <p className="text-xs text-ink-secondary">Download GST tax invoices with SAC code 998311.</p>
                <button
                  onClick={() => setActiveTab("invoices")}
                  className="text-xs font-semibold text-[#1D62EA] hover:underline pt-1 inline-flex items-center gap-1"
                >
                  <span>View Invoices</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Subscription Plans</span>
                  <Settings className="h-4 w-4 text-[#1D62EA]" />
                </div>
                <p className="text-xs text-ink-secondary">Upgrade creator discovery quota and Aadhaar e-sign.</p>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="text-xs font-semibold text-[#1D62EA] hover:underline pt-1 inline-flex items-center gap-1"
                >
                  <span>Manage Plans</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: SETTINGS & AGENCY MONETIZATION */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white">Agency Membership Plans &amp; Search Quotas</h2>
              <p className="text-xs text-ink-secondary mt-1">
                Manage your agency tier, creator discovery capacity, and platform privileges.
              </p>
            </div>

            {/* Current Quota Status Banner */}
            <div className="rounded-xl border border-border-strong bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-ink-muted">Explore Directory Capacity</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">
                    {creatorMeta.totalMatching || creators.length} Creators Available
                  </span>
                  <span className="rounded bg-[#1D62EA]/10 border border-[#1D62EA]/30 px-2.5 py-0.5 text-xs font-semibold text-[#1D62EA]">
                    {settingsPlanTier.toUpperCase()} TIER
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">
                  To view and partner with more creators across India, upgrade your agency subscription below.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("profile")}
                className="rounded-lg border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-white hover:border-[#1D62EA] transition-colors"
              >
                Edit Company Profile
              </button>
            </div>

            {/* Plan Tier Selection Cards */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Available Agency Membership Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Basic Agency */}
                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-colors ${
                    settingsPlanTier === "basic"
                      ? "border-[#1D62EA] bg-[#1D62EA]/10"
                      : "border-border-subtle bg-surface hover:border-border-strong"
                  }`}
                  onClick={() => setSettingsPlanTier("basic")}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-white">Basic Agency</span>
                      <span className="text-xs font-bold text-ink-muted">₹0 / mo</span>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Essential escrow workflows for boutique brands testing creator collaborations.
                    </p>
                    <ul className="text-xs text-ink-secondary space-y-1 pt-2">
                      <li>• 5 creators visible in explore directory</li>
                      <li>• SHA-256 cryptographic sealed contracts</li>
                      <li>• Razorpay Route Escrow &amp; P2P mode</li>
                      <li>• Standard email support</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettingsPlanTier("basic")}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold ${
                      settingsPlanTier === "basic"
                        ? "bg-[#1D62EA] text-white"
                        : "bg-surface-elevated text-ink-secondary"
                    }`}
                  >
                    {settingsPlanTier === "basic" ? "Active Plan" : "Choose Basic"}
                  </button>
                </div>

                {/* Agency Pro */}
                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-colors ${
                    settingsPlanTier === "pro"
                      ? "border-[#1D62EA] bg-[#1D62EA]/10"
                      : "border-border-subtle bg-surface hover:border-border-strong"
                  }`}
                  onClick={() => setSettingsPlanTier("pro")}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#1D62EA]">Agency Pro</span>
                      <span className="text-xs font-bold text-white">₹4,999 / mo</span>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      For fast-growing D2C brands &amp; performance agencies running continuous campaigns.
                    </p>
                    <ul className="text-xs text-ink-secondary space-y-1 pt-2">
                      <li>• 10 creators visible in explore directory</li>
                      <li>• Aadhaar OTP mutual e-signing opt-in</li>
                      <li>• 1-click WhatsApp payment &amp; deadline alerts</li>
                      <li>• Priority dispute resolution queue</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettingsPlanTier("pro")}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold ${
                      settingsPlanTier === "pro"
                        ? "bg-[#1D62EA] text-white"
                        : "bg-surface-elevated text-ink-secondary"
                    }`}
                  >
                    {settingsPlanTier === "pro" ? "Active Plan" : "Upgrade to Pro"}
                  </button>
                </div>

                {/* Agency Enterprise */}
                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-colors ${
                    settingsPlanTier === "enterprise"
                      ? "border-[#1D62EA] bg-[#1D62EA]/10"
                      : "border-border-subtle bg-surface hover:border-border-strong"
                  }`}
                  onClick={() => setSettingsPlanTier("enterprise")}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-amber-300">Enterprise</span>
                      <span className="text-xs font-bold text-white">₹19,999 / mo</span>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Full-scale agency operations with multi-seat teams and dedicated account mediation.
                    </p>
                    <ul className="text-xs text-ink-secondary space-y-1 pt-2">
                      <li>• 50 creators visible in explore directory</li>
                      <li>• Dedicated Campaign Manager support</li>
                      <li>• Automated Section 194C Form 16A preparation</li>
                      <li>• Multi-seat accounts &amp; batch escrow releases</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettingsPlanTier("enterprise")}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold ${
                      settingsPlanTier === "enterprise"
                        ? "bg-[#1D62EA] text-white"
                        : "bg-surface-elevated text-ink-secondary"
                    }`}
                  >
                    {settingsPlanTier === "enterprise" ? "Active Plan" : "Upgrade to Enterprise"}
                  </button>
                </div>
              </div>
            </div>

            {/* Tier Confirmation Action */}
            <div className="rounded-xl border border-border-strong bg-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-ink-muted block">Selected Tier</span>
                <span className="text-base font-bold text-white capitalize">{settingsPlanTier} Plan</span>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Plan change applies immediately to your explore search limits and contract privileges.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-lg bg-[#1D62EA] px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors shrink-0"
              >
                Confirm Plan Selection
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 4.2 PROPOSE DEAL MODAL */}
      {/* ======================================================== */}
      {proposeModalOpen && (
        <div data-ui="modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            <div data-ui="divider" className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Propose Campaign Collaboration</h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Set commercial terms, deliverables, TDS deductions, and escrow parameters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProposeModalOpen(false)}
                className="text-ink-muted hover:text-white p-1"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProposeDealSubmit} className="space-y-4">
              {/* Creator Selector / Display */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Selected Creator</label>
                {selectedCreatorForDeal ? (
                  <div className="rounded-lg border border-border-subtle bg-surface-elevated p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{selectedCreatorForDeal.name}</span>
                      <span className="text-ink-muted block">{selectedCreatorForDeal.niche}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCreatorForDeal(null)}
                      className="text-xs text-[#1D62EA] hover:underline"
                    >
                      Change Creator
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    onChange={(e) => {
                      const found = creators.find((c) => c.id === e.target.value);
                      if (found) {
                        setSelectedCreatorForDeal(found);
                        setDealGrossAmount(String(found.base_rate_inr || 50000));
                      }
                    }}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  >
                    <option value="">Select a creator from your roster...</option>
                    {creators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.niche}) — Base: ₹{Number(c.base_rate_inr).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Campaign Title & Deliverable Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Campaign Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nordic Audio Launch - Dedicated Review"
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Primary Deliverable</label>
                  <select
                    value={dealDeliverableType}
                    onChange={(e) => setDealDeliverableType(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  >
                    <option value="Dedicated YouTube Video">Dedicated YouTube Video (8-10 min)</option>
                    <option value="YouTube Integrated Segment">YouTube Integrated Segment (60-90s)</option>
                    <option value="Instagram Reel">Instagram Reel (30-60s)</option>
                    <option value="Instagram Carousel Post">Instagram Carousel Post</option>
                    <option value="Multi-Platform Bundle">Multi-Platform Bundle (YouTube + Reel)</option>
                  </select>
                </div>
              </div>

              {/* Campaign Brief */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-primary">Campaign Brief &amp; Key Talking Points</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the product value proposition, mandatory mentions, call to action link, and do's & don'ts..."
                  value={dealBrief}
                  onChange={(e) => setDealBrief(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                />
              </div>

              {/* Commercial Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Gross Deal Value (INR)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={dealGrossAmount}
                    onChange={(e) => setDealGrossAmount(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Advance Payment (%)</label>
                  <select
                    value={dealAdvancePercent}
                    onChange={(e) => setDealAdvancePercent(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  >
                    <option value="0">0% (100% on delivery)</option>
                    <option value="20">20% Advance</option>
                    <option value="30">30% Advance</option>
                    <option value="50">50% Advance (Standard)</option>
                    <option value="100">100% Upfront Escrow</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Delivery Window</label>
                  <select
                    value={dealDeadlineDays}
                    onChange={(e) => setDealDeadlineDays(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  >
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="21">21 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
              </div>

              {/* Payment Mode & TDS Deduction Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Payment &amp; Escrow Mode</label>
                  <select
                    value={dealPaymentMode}
                    onChange={(e) => setDealPaymentMode(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  >
                    <option value="ESCROW_RAZORPAY">Razorpay Route Escrow Vault (Recommended)</option>
                    <option value="DIRECT_P2P">Direct P2P UPI / IMPS (UTR verified)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Statutory TDS Deduction (CBDT)</label>
                  <select
                    value={dealTdsSection}
                    onChange={(e) => setDealTdsSection(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  >
                    <option value="NONE">Exempt / No TDS Withholding</option>
                    <option value="194C_1PCT">Sec 194C (1% - Individual / HUF)</option>
                    <option value="194C_2PCT">Sec 194C (2% - Companies / Others)</option>
                    <option value="194J_2PCT">Sec 194J (2% - Technical / Production)</option>
                    <option value="194J_10PCT">Sec 194J (10% - Royalty / IP Licensing)</option>
                  </select>
                </div>
              </div>

              {/* Signature Method */}
              <div className="rounded-lg border border-border-subtle bg-surface-elevated p-3 space-y-2 text-xs">
                <span className="font-semibold text-white block">Statutory Signing Framework:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-ink-primary cursor-pointer">
                    <input
                      type="radio"
                      name="signatureMethod"
                      checked={dealSignatureMethod === "SHA256_CRYPTOGRAPHIC"}
                      onChange={() => setDealSignatureMethod("SHA256_CRYPTOGRAPHIC")}
                    />
                    <span>SHA-256 Cryptographic Digest (Default IT Act §10A)</span>
                  </label>
                  <label className="flex items-center gap-2 text-ink-primary cursor-pointer">
                    <input
                      type="radio"
                      name="signatureMethod"
                      checked={dealSignatureMethod === "AADHAAR_ESIGN_OPT_IN"}
                      onChange={() => setDealSignatureMethod("AADHAAR_ESIGN_OPT_IN")}
                    />
                    <span>Aadhaar OTP e-Sign (Mutual Opt-in)</span>
                  </label>
                </div>
              </div>

              {/* Financial Summary Calculation Card */}
              <div className="rounded-lg bg-surface-elevated p-4 space-y-2 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <span>Gross Deal Amount:</span>
                  <span className="font-bold text-white tabular-nums">
                    ₹{calcProposalGross.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Advance to be Held in Escrow ({dealAdvancePercent}%):</span>
                  <span className="font-bold text-[#FF5B00] tabular-nums">
                    ₹{calcProposalAdvance.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Balance Payable on Final Delivery:</span>
                  <span className="font-bold text-white tabular-nums">
                    ₹{calcProposalBalance.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>TDS Withheld ({dealTdsSection}):</span>
                  <span className="font-bold text-ink-secondary tabular-nums">
                    -₹{calcTdsDeduction.toLocaleString("en-IN")}
                  </span>
                </div>
                <div data-ui="divider" className="flex justify-between text-white font-bold border-t border-border-subtle pt-2">
                  <span>Net Settled Amount:</span>
                  <span className="text-[#1D62EA] tabular-nums">
                    ₹{calcNetPayable.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Optional Negotiation Note */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-primary">
                  Initial Message / Negotiation Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Excited to work together. Open to discussing the deliverables schedule."
                  value={dealInitialMessage}
                  onChange={(e) => setDealInitialMessage(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProposeModalOpen(false)}
                  className="rounded-lg border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1D62EA] px-6 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  Seal &amp; Propose Deal (SHA-256)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.3 NEGOTIATION THREAD DRAWER / MODAL */}
      {/* ======================================================== */}
      {selectedContractForNegotiation && (
        <div data-ui="modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div data-ui="divider" className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div>
                <code className="text-xs text-[#1D62EA]">
                  {selectedContractForNegotiation.contract_number}
                </code>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Negotiate Terms: {selectedContractForNegotiation.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContractForNegotiation(null)}
                className="text-ink-muted hover:text-white p-1"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Terms Banner */}
            <div className="rounded-lg bg-surface-elevated p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-ink-muted block text-[11px]">Current Agreed Rate:</span>
                <span className="font-bold text-white">
                  ₹{Number(selectedContractForNegotiation.gross_amount_inr).toLocaleString("en-IN")} (Advance: {selectedContractForNegotiation.advance_percent}%)
                </span>
              </div>
              <span className="rounded bg-[#1D62EA]/15 text-[#1D62EA] px-2 py-0.5 text-[10px] font-bold">
                Status: {selectedContractForNegotiation.status}
              </span>
            </div>

            {/* Negotiation Messages Log */}
            <div className="space-y-3 max-h-56 overflow-y-auto p-1">
              {negotiationsList.length === 0 ? (
                <div className="text-center text-xs text-ink-muted py-6">
                  No previous negotiation messages. You can propose counter terms below.
                </div>
              ) : (
                negotiationsList.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg p-3 text-xs space-y-1 ${
                      n.sender_role === "AGENCY"
                        ? "bg-[#1D62EA]/10 border border-[#1D62EA]/20 ml-6"
                        : "bg-surface-elevated border border-border-subtle mr-6"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">
                        {n.sender_name} ({n.sender_role})
                      </span>
                      <span className="text-ink-muted">
                        {new Date(n.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-ink-secondary">{n.message}</p>
                    {n.proposed_gross_amount_inr && (
                      <div className="text-[11px] font-medium text-amber-300 pt-1">
                        Proposed Rate: ₹{Number(n.proposed_gross_amount_inr).toLocaleString("en-IN")} • Advance: {n.proposed_advance_percent}%
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Counter Offer Input */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Counter Gross Rate (INR)</label>
                  <input
                    type="number"
                    value={counterGross}
                    onChange={(e) => setCounterGross(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Counter Advance (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={counterAdvance}
                    onChange={(e) => setCounterAdvance(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-primary">Message / Reasoning</label>
                <input
                  type="text"
                  placeholder="Explain rate adjustment or confirm terms..."
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleSendNegotiationMessage("REPLY")}
                  className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#1D62EA]"
                >
                  Send Message
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendNegotiationMessage("COUNTER_OFFER")}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                  >
                    Send Counter Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendNegotiationMessage("ACCEPT_COUNTER")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    Accept Revised Terms
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.5 REQUEST REVISION MODAL */}
      {/* ======================================================== */}
      {revisionModalDeliverable && (
        <div data-ui="modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-4">
            <div>
              <code className="text-xs text-[#1D62EA]">
                {revisionModalDeliverable.contract_number}
              </code>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Request Deliverable Revision
              </h3>
              <p className="text-xs text-ink-secondary mt-1">
                Provide clear, timestamped feedback for the creator to amend.
              </p>
            </div>

            <form onSubmit={handleRequestRevisionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-primary">
                  Specific Revision Instructions &amp; Timestamps
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. At 02:15, please emphasize the 20% discount coupon code on screen. In the video description, make sure the trackable UTM link is placed in the first two lines."
                  value={revisionNotesInput}
                  onChange={(e) => setRevisionNotesInput(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalDeliverable(null)}
                  className="rounded-lg border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-ink-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-500"
                >
                  Send Revision Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.6 FORMAL B2B GST TAX INVOICE VIEWER */}
      {/* ======================================================== */}
      {selectedInvoice && (
        <div data-ui="modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Watermark Banner if Basic Creator */}
            {selectedInvoice.watermark_enabled && (
              <code className="block rounded bg-amber-400/10 border border-amber-400/20 p-2.5 text-xs text-amber-200 text-center">
                [ WATERMARK: Powered by CreateKar Sovereign Escrow ]
              </code>
            )}

            <div data-ui="divider" className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <code className="text-xs font-bold text-[#1D62EA]">B2B TAX INVOICE</code>
                <h3 className="text-xl font-bold text-white mt-1">{selectedInvoice.invoice_number}</h3>
                <p className="text-xs text-ink-muted">
                  Date: {new Date(selectedInvoice.issued_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="font-semibold text-white block">SAC Code: 998311</span>
                <span className="text-ink-muted">Advertising &amp; Promotion Services</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-ink-muted block text-[11px] font-semibold">Billed By (Creator)</span>
                <p className="font-bold text-white">{selectedInvoice.creator_name}</p>
                <p className="text-ink-secondary">GSTIN: {selectedInvoice.creator_gstin || "Unregistered / Composition"}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-ink-muted block text-[11px] font-semibold">Billed To (Agency)</span>
                <p className="font-bold text-white">{selectedInvoice.company_name || agencyProfile.company_name}</p>
                <p className="text-ink-secondary">GSTIN: {selectedInvoice.agency_gstin || agencyProfile.gstin || "29AABCN5678F1Z1"}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div data-ui="table-wrapper" className="border border-border-subtle rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-elevated text-ink-muted text-[11px]">
                  <tr>
                    <th className="p-3">Service Description</th>
                    <th className="p-3 text-right">Taxable Value (INR)</th>
                  </tr>
                </thead>
                <tbody data-ui="table-body" className="divide-y divide-border-subtle">
                  <tr>
                    <td className="p-3 text-white">
                      Campaign Marketing Services ({selectedInvoice.contract_title})
                    </td>
                    <td className="p-3 text-right tabular-nums text-white">
                      ₹{Number(selectedInvoice.taxable_value_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ink-muted">CGST (9%)</td>
                    <td className="p-3 text-right tabular-nums text-ink-muted">
                      ₹{Number(selectedInvoice.cgst_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ink-muted">SGST (9%)</td>
                    <td className="p-3 text-right tabular-nums text-ink-muted">
                      ₹{Number(selectedInvoice.sgst_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr className="bg-surface-elevated font-bold text-white">
                    <td className="p-3">Total Amount Settled (incl. GST)</td>
                    <td className="p-3 text-right tabular-nums text-[#1D62EA]">
                      ₹{Number(selectedInvoice.total_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-ink-muted">
                Status: {selectedInvoice.status} • Settled via CreateKar Razorpay Route Escrow
              </span>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg bg-surface-elevated border border-border-subtle px-4 py-2 text-xs font-semibold text-white hover:border-[#1D62EA]"
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
