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
  X,
  Plus,
  Share2,
  Receipt,
  UserCheck,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileCheck2,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "sonner";

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "contracts" | "deliveries" | "invoices" | "payments" | "plan" | "profile"
  >("overview");
  const [profileSubTab, setProfileSubTab] = useState<"profile" | "contracts" | "invoices" | "earnings">("profile");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [contracts, setContracts] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any>({ transactions: [], payoutDetails: {} });
  const [registeredAgencies, setRegisteredAgencies] = useState<any[]>([]);

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

  // Full Profile editing state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileNiche, setProfileNiche] = useState("Tech & AI");
  const [profileInstagram, setProfileInstagram] = useState("");
  const [profileYoutube, setProfileYoutube] = useState("");
  const [profileBaseRate, setProfileBaseRate] = useState("");
  const [profilePan, setProfilePan] = useState("");
  const [profileGstin, setProfileGstin] = useState("");
  const [profileBillingAddress, setProfileBillingAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Invoice viewer modal
  const [viewInvoice, setViewInvoice] = useState<any>(null);

  // Create Contract modal state
  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);
  const [contractClientType, setContractClientType] = useState<"EXTERNAL" | "REGISTERED">("EXTERNAL");
  const [contractAgencyId, setContractAgencyId] = useState("");
  const [contractClientCompany, setContractClientCompany] = useState("");
  const [contractClientName, setContractClientName] = useState("");
  const [contractClientEmail, setContractClientEmail] = useState("");
  const [contractClientPhone, setContractClientPhone] = useState("");
  const [contractTitle, setContractTitle] = useState("");
  const [contractBrief, setContractBrief] = useState("");
  const [contractGross, setContractGross] = useState("50000");
  const [contractAdvancePercent, setContractAdvancePercent] = useState("50");
  const [contractPaymentMode, setContractPaymentMode] = useState<"ESCROW_RAZORPAY" | "DIRECT_P2P">("ESCROW_RAZORPAY");
  const [contractTdsSection, setContractTdsSection] = useState("NONE");
  const [contractDeliverables, setContractDeliverables] = useState<Array<{ type: string; description: string; deadline: string }>>([
    { type: "Instagram Reel", description: "1x 60s Reel with product integration", deadline: "" }
  ]);
  const [creatingContract, setCreatingContract] = useState(false);

  // Contract Share Modal state
  const [contractShareModalOpen, setContractShareModalOpen] = useState(false);
  const [createdContractData, setCreatedContractData] = useState<any | null>(null);

  // Create Invoice modal state
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [invoiceSource, setInvoiceSource] = useState<"CONTRACT" | "STANDALONE">("CONTRACT");
  const [invoiceContractId, setInvoiceContractId] = useState("");
  const [invoiceClientCompany, setInvoiceClientCompany] = useState("");
  const [invoiceClientName, setInvoiceClientName] = useState("");
  const [invoiceClientEmail, setInvoiceClientEmail] = useState("");
  const [invoiceClientGstin, setInvoiceClientGstin] = useState("");
  const [invoiceClientAddress, setInvoiceClientAddress] = useState("");
  const [invoiceServiceDesc, setInvoiceServiceDesc] = useState("Creator Campaign & Content Services");
  const [invoiceSacCode, setInvoiceSacCode] = useState("998311");
  const [invoiceTaxableValue, setInvoiceTaxableValue] = useState("50000");
  const [invoiceTdsSection, setInvoiceTdsSection] = useState("NONE");
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invoiceShareModalOpen, setInvoiceShareModalOpen] = useState(false);
  const [createdInvoiceData, setCreatedInvoiceData] = useState<any | null>(null);
  const [showUpsellBanner, setShowUpsellBanner] = useState(false);

  // Negotiation modal
  const [selectedContractForNegotiation, setSelectedContractForNegotiation] = useState<any | null>(null);
  const [negotiationsList, setNegotiationsList] = useState<any[]>([]);
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [counterGross, setCounterGross] = useState("");
  const [counterAdvance, setCounterAdvance] = useState("");

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
      toast.error("Failed to load negotiation thread.");
    }
  };

  const handleSendNegotiationMessage = async (action: "REPLY" | "COUNTER_OFFER" | "ACCEPT_COUNTER") => {
    if (!selectedContractForNegotiation) return;
    try {
      const res = await fetch(`/api/agency/contracts/${selectedContractForNegotiation.id}/negotiations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: negotiationMessage || (action === "ACCEPT_COUNTER" ? "Revised deal terms accepted by creator." : "Counter proposal submitted."),
          proposed_gross_amount_inr: action !== "REPLY" ? Number(counterGross) : undefined,
          proposed_advance_percent: action !== "REPLY" ? Number(counterAdvance) : undefined,
          action
        })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit negotiation.");
        return;
      }
      toast.success(action === "ACCEPT_COUNTER" ? "Terms accepted and sealed!" : "Negotiation sent!");
      setNegotiationMessage("");
      handleOpenNegotiations(selectedContractForNegotiation);
      loadData();
    } catch {
      toast.error("Error submitting negotiation.");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [overviewRes, contractsRes, delivRes, invRes, payoutsRes, agenciesRes] = await Promise.all([
        fetch("/api/creator/overview").then((r) => r.json()),
        fetch("/api/creator/contracts").then((r) => r.json()),
        fetch("/api/creator/deliverables").then((r) => r.json()),
        fetch("/api/creator/invoices").then((r) => r.json()),
        fetch("/api/creator/payouts").then((r) => r.json()),
        fetch("/api/creator/agencies").then((r) => r.json()).catch(() => ({ agencies: [] }))
      ]);

      if (overviewRes.success) {
        setProfile(overviewRes.profile || {});
        setStats(overviewRes.stats || {});
        setProfileName(overviewRes.profile?.name || "");
        setProfilePhone(overviewRes.profile?.phone || "");
        setProfileBio(overviewRes.profile?.bio || "");
        setProfileNiche(overviewRes.profile?.niche || "Tech & AI");
        setProfileInstagram(overviewRes.profile?.instagram_handle || "");
        setProfileYoutube(overviewRes.profile?.youtube_handle || "");
        setProfileBaseRate(overviewRes.profile?.base_rate_inr ? String(overviewRes.profile?.base_rate_inr) : "");
        setProfilePan(overviewRes.profile?.pan || "");
        setProfileGstin(overviewRes.profile?.gstin || "");
        setProfileBillingAddress(overviewRes.profile?.billing_address || "");
      }
      if (contractsRes.success) {
        setContracts(contractsRes.contracts || []);
      }
      if (delivRes.success) {
        setDeliverables(delivRes.deliverables || []);
      }
      if (invRes.success) {
        setInvoices(invRes.invoices || []);
        if (invRes.invoices?.some((i: any) => i.is_standalone)) {
          setShowUpsellBanner(true);
        }
      }
      if (payoutsRes.success) {
        setPayouts(payoutsRes);
        setEditUpiId(payoutsRes.payoutDetails?.upi_id || "");
        setEditBankAccount(payoutsRes.payoutDetails?.bank_account_number || "");
        setEditIfsc(payoutsRes.payoutDetails?.bank_ifsc || "");
      }
      if (agenciesRes && agenciesRes.agencies) {
        setRegisteredAgencies(agenciesRes.agencies);
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

  // 6. Generate Contract WhatsApp Share Link
  const getContractWhatsAppShareUrl = (signingUrl: string, clientName: string, title: string, amount: number) => {
    const text = encodeURIComponent(
      `Hi ${clientName || "Partner"}, here is the collaboration agreement for "${title}" (Value: ₹${amount.toLocaleString("en-IN")}) on CreateKar: ${signingUrl}. Review and sign instantly with SHA-256 seal (no login required). Thank you!`
    );
    return `https://wa.me/?text=${text}`;
  };

  // 7. Generate Invoice WhatsApp Share Link
  const getInvoiceWhatsAppShareUrl = (invoiceNumber: string, clientName: string, total: number) => {
    const text = encodeURIComponent(
      `Hi ${clientName || "Partner"}, please find tax invoice ${invoiceNumber} for ₹${total.toLocaleString("en-IN")} via CreateKar. Thank you!`
    );
    return `https://wa.me/?text=${text}`;
  };

  // 8. Handle Create Contract
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractTitle.trim() || !contractBrief.trim() || !contractGross) {
      toast.error("Please fill in contract title, brief, and gross amount.");
      return;
    }
    if (contractClientType === "EXTERNAL" && !contractClientCompany.trim()) {
      toast.error("Please enter the client or agency company name.");
      return;
    }
    setCreatingContract(true);
    try {
      const res = await fetch("/api/creator/contracts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_type: contractClientType,
          agency_id: contractClientType === "REGISTERED" ? contractAgencyId : undefined,
          client_company: contractClientCompany.trim(),
          client_name: contractClientName.trim(),
          client_email: contractClientEmail.trim(),
          client_phone: contractClientPhone.trim(),
          title: contractTitle.trim(),
          campaign_brief: contractBrief.trim(),
          gross_amount_inr: Number(contractGross),
          advance_percent: Number(contractAdvancePercent),
          payment_mode: contractPaymentMode,
          tds_section: contractTdsSection,
          deliverables: contractDeliverables.filter((d) => d.type.trim())
        })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create contract proposal");
        setCreatingContract(false);
        return;
      }
      toast.success("Contract proposal generated & sealed!");
      setCreateContractModalOpen(false);
      setCreatedContractData({
        contractNumber: data.contractNumber,
        publicSigningUrl: data.publicSigningUrl || `${window.location.origin}/contracts/sign/${data.guestSignToken}`,
        clientCompany: data.clientCompany,
        clientName: contractClientName,
        clientPhone: contractClientPhone,
        clientEmail: contractClientEmail,
        grossAmount: Number(contractGross),
        title: contractTitle,
        sha256Digest: data.sha256Digest
      });
      setContractShareModalOpen(true);
      // Reset form fields
      setContractTitle("");
      setContractBrief("");
      setContractClientCompany("");
      setContractClientEmail("");
      setContractClientPhone("");
      loadData();
    } catch {
      toast.error("Network error creating contract");
    } finally {
      setCreatingContract(false);
    }
  };

  // 9. Pre-fill Invoice details from selected contract
  const handleSelectContractForInvoice = (contractId: string) => {
    setInvoiceContractId(contractId);
    const selected = contracts.find((c) => c.id === contractId);
    if (selected) {
      setInvoiceClientCompany(selected.company_name || selected.client_company || "");
      setInvoiceClientName(selected.client_name || selected.agency_name || "");
      setInvoiceClientEmail(selected.client_email || "");
      setInvoiceClientGstin(selected.agency_gstin || "");
      setInvoiceTaxableValue(String(selected.gross_amount_inr || ""));
      setInvoiceServiceDesc(`Creator Collaboration Services - ${selected.title}`);
      setInvoiceTdsSection(selected.tds_section || "NONE");
    }
  };

  // 10. Handle Create Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceSource === "CONTRACT" && !invoiceContractId) {
      toast.error("Please select a contract to base this invoice on.");
      return;
    }
    if (invoiceSource === "STANDALONE" && (!invoiceClientCompany.trim() || !invoiceTaxableValue)) {
      toast.error("Please enter the client company name and taxable value.");
      return;
    }
    setCreatingInvoice(true);
    try {
      const res = await fetch("/api/creator/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: invoiceSource,
          contract_id: invoiceSource === "CONTRACT" ? invoiceContractId : undefined,
          client_company: invoiceClientCompany.trim(),
          client_name: invoiceClientName.trim(),
          client_email: invoiceClientEmail.trim(),
          client_gstin: invoiceClientGstin.trim(),
          client_address: invoiceClientAddress.trim(),
          service_description: invoiceServiceDesc.trim(),
          sac_code: invoiceSacCode.trim() || "998311",
          taxable_value_inr: Number(invoiceTaxableValue),
          tds_section: invoiceTdsSection
        })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate invoice");
        setCreatingInvoice(false);
        return;
      }
      toast.success("Tax Invoice generated successfully!");
      setCreateInvoiceModalOpen(false);
      setCreatedInvoiceData(data);
      setInvoiceShareModalOpen(true);
      if (data.isStandalone) {
        setShowUpsellBanner(true);
      }
      loadData();
    } catch {
      toast.error("Network error creating invoice");
    } finally {
      setCreatingInvoice(false);
    }
  };

  // 11. Handle Save Full Profile
  const handleSaveFullProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          phone: profilePhone.trim(),
          bio: profileBio.trim(),
          niche: profileNiche.trim(),
          instagram_handle: profileInstagram.trim(),
          youtube_handle: profileYoutube.trim(),
          base_rate_inr: profileBaseRate ? Number(profileBaseRate) : undefined,
          pan: profilePan.trim().toUpperCase(),
          gstin: profileGstin.trim().toUpperCase(),
          billing_address: profileBillingAddress.trim(),
          upi_id: editUpiId.trim(),
          bank_account_number: editBankAccount.trim(),
          bank_ifsc: editIfsc.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        setSavingProfile(false);
        return;
      }
      toast.success("Profile, tax details, and payout coordinates saved!");
      loadData();
    } catch {
      toast.error("Network error updating profile");
    } finally {
      setSavingProfile(false);
    }
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

            {/* Quick Actions Strip */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCreateContractModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#FF5B00] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Contract</span>
              </button>
              <button
                onClick={() => setCreateInvoiceModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface-elevated px-4 py-2.5 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Generate Tax Invoice</span>
              </button>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Campaign Contracts</h2>
                <p className="text-xs text-ink-secondary mt-1">
                  All agreements sealed with SHA-256 cryptographic verification and statutory terms.
                </p>
              </div>
              <button
                onClick={() => setCreateContractModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Create Contract</span>
              </button>
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
                      {c.guest_sign_token && (
                        <button
                          onClick={() => {
                            setCreatedContractData({
                              contractNumber: c.contract_number,
                              publicSigningUrl: `${window.location.origin}/contracts/sign/${c.guest_sign_token}`,
                              clientCompany: c.company_name || c.client_company,
                              clientName: c.client_name,
                              clientPhone: c.client_phone || "",
                              clientEmail: c.client_email || "",
                              grossAmount: c.gross_amount_inr,
                              title: c.title,
                              sha256Digest: c.sha256_digest
                            });
                            setContractShareModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Share Sign Link</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenNegotiations(c)}
                        className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Negotiation</span>
                      </button>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">GST Invoices</h2>
                <p className="text-xs text-ink-secondary mt-1">
                  Automated B2B tax invoices generated upon contract milestones or standalone engagements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Watermark Rule Indicator */}
                <div className="rounded-lg border border-border-strong bg-surface-elevated px-3 py-1.5 text-xs text-ink-muted hidden md:block">
                  {profile.plan_tier === "influencer" ? (
                    <span className="text-amber-300 font-medium">
                      Influencer Plan: Watermark-free clean GST Invoices
                    </span>
                  ) : (
                    <span>
                      Invoices carry &quot;Powered by CreateKar&quot; watermark.
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setCreateInvoiceModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Invoice</span>
                </button>
              </div>
            </div>

            {/* Persistent Standalone Contract Upsell Banner */}
            <div className="rounded-xl border border-border-strong bg-surface-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-ui="callout">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-[#FF5B00] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs text-white font-semibold">
                    CreateKar can make the finest invoices based on contracts!
                  </p>
                  <p className="text-xs text-ink-secondary">
                    Linking invoices directly to contracts guarantees agreed advance escrow, automated milestone releases, and CBDT-compliant TDS schedules. Try the contracts feature next time if you like!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateContractModalOpen(true)}
                className="rounded-lg bg-surface border border-border-subtle px-3.5 py-1.5 text-xs font-semibold text-white hover:border-[#FF5B00] shrink-0 transition-colors"
              >
                Create Contract
              </button>
            </div>

            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                  No invoices generated yet. Generate an invoice from an existing contract or create a standalone invoice.
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
                        {inv.is_standalone && (
                          <span className="rounded bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary border border-border-subtle">
                            Standalone Invoice
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-white">{inv.company_name}</h4>
                      <p className="text-[11px] text-ink-muted">
                        {inv.contract_title} ({inv.contract_number}) • {inv.service_description || "Creator Services"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-ink-muted block">Total (with GST)</span>
                        <span className="text-sm font-bold tabular-nums text-white">
                          ₹{Number(inv.total_inr).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <a
                        href={getInvoiceWhatsAppShareUrl(inv.invoice_number, inv.company_name, Number(inv.total_inr))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:text-white hover:border-[#FF5B00] transition-colors"
                      >
                        Share via WhatsApp
                      </a>

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
        {/* ======================================================== */}
        {/* TAB 7: DEDICATED PROFILE SECTION */}
        {/* ======================================================== */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">My Creator Profile &amp; Workspace</h2>
                <p className="text-xs text-ink-secondary mt-1">
                  Manage your public persona, statutory tax registration (PAN/GSTIN), payout coordinates, and campaign portfolio.
                </p>
              </div>

              {/* Sub-section Navigation Pills */}
              <div className="flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface p-1">
                <button
                  type="button"
                  onClick={() => setProfileSubTab("profile")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    profileSubTab === "profile"
                      ? "bg-[#FF5B00] text-white"
                      : "text-ink-secondary hover:text-white"
                  }`}
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab("contracts")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    profileSubTab === "contracts"
                      ? "bg-[#FF5B00] text-white"
                      : "text-ink-secondary hover:text-white"
                  }`}
                >
                  My Contracts ({contracts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab("invoices")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    profileSubTab === "invoices"
                      ? "bg-[#FF5B00] text-white"
                      : "text-ink-secondary hover:text-white"
                  }`}
                >
                  My Invoices ({invoices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab("earnings")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    profileSubTab === "earnings"
                      ? "bg-[#FF5B00] text-white"
                      : "text-ink-secondary hover:text-white"
                  }`}
                >
                  My Earnings
                </button>
              </div>
            </div>

            {/* Sub-section 1: Edit Profile Form */}
            {profileSubTab === "profile" && (
              <form onSubmit={handleSaveFullProfile} className="space-y-6">
                {/* 1. Personal & Social Channels */}
                <div className="rounded-xl border border-border-strong bg-surface p-6 space-y-4">
                  <div data-ui="divider" className="flex items-center gap-2 text-white font-semibold text-sm border-b border-border-subtle pb-3">
                    <UserCheck className="h-4 w-4 text-[#FF5B00]" />
                    <span>Creator Identity &amp; Channel Reach</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Full Legal / Creator Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Primary Phone / WhatsApp</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Primary Content Niche</label>
                      <select
                        value={profileNiche}
                        onChange={(e) => setProfileNiche(e.target.value)}
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      >
                        <option value="Tech & AI">Tech &amp; AI</option>
                        <option value="Finance & Wealth">Finance &amp; Wealth</option>
                        <option value="Fitness & Nutrition">Fitness &amp; Nutrition</option>
                        <option value="Beauty & Skincare">Beauty &amp; Skincare</option>
                        <option value="Travel & Heritage">Travel &amp; Heritage</option>
                        <option value="Gaming & Esports">Gaming &amp; Esports</option>
                        <option value="Productivity & SaaS">Productivity &amp; SaaS</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Instagram Handle</label>
                      <input
                        type="text"
                        value={profileInstagram}
                        onChange={(e) => setProfileInstagram(e.target.value)}
                        placeholder="@yourhandle"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">YouTube Channel Handle</label>
                      <input
                        type="text"
                        value={profileYoutube}
                        onChange={(e) => setProfileYoutube(e.target.value)}
                        placeholder="@youtubechannel"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Base Collaboration Rate (INR)</label>
                      <input
                        type="number"
                        value={profileBaseRate}
                        onChange={(e) => setProfileBaseRate(e.target.value)}
                        placeholder="25000"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Creator Bio / Profile Summary</label>
                    <textarea
                      rows={2}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="Brief overview of your channel audience and content style..."
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Tax & Statutory Information */}
                <div className="rounded-xl border border-border-strong bg-surface p-6 space-y-4">
                  <div data-ui="divider" className="flex items-center gap-2 text-white font-semibold text-sm border-b border-border-subtle pb-3">
                    <Building2 className="h-4 w-4 text-[#FF5B00]" />
                    <span>Statutory Tax &amp; Billing Coordinates</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Permanent Account Number (PAN)</label>
                      <input
                        type="text"
                        value={profilePan}
                        onChange={(e) => setProfilePan(e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                      <span className="text-[10px] text-ink-muted">Mandatory for TDS credit certificates under Section 194C / 194J</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">GSTIN (Optional if under ₹20L exemption)</label>
                      <input
                        type="text"
                        value={profileGstin}
                        onChange={(e) => setProfileGstin(e.target.value.toUpperCase())}
                        placeholder="27ABCDE1234F1Z5"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                      <span className="text-[10px] text-ink-muted">Required to issue formal tax invoices with 18% GST credit</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Registered Billing Address</label>
                    <textarea
                      rows={2}
                      value={profileBillingAddress}
                      onChange={(e) => setProfileBillingAddress(e.target.value)}
                      placeholder="Your official residential or studio address printed on GST invoices..."
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Payout Accounts */}
                <div className="rounded-xl border border-border-strong bg-surface p-6 space-y-4">
                  <div data-ui="divider" className="flex items-center gap-2 text-white font-semibold text-sm border-b border-border-subtle pb-3">
                    <Wallet className="h-4 w-4 text-[#FF5B00]" />
                    <span>Payout Channels (UPI &amp; Bank Transfer)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Primary UPI ID (VPA)</label>
                      <input
                        type="text"
                        value={editUpiId}
                        onChange={(e) => setEditUpiId(e.target.value)}
                        placeholder="yourhandle@upi"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Bank Account Number</label>
                      <input
                        type="text"
                        value={editBankAccount}
                        onChange={(e) => setEditBankAccount(e.target.value)}
                        placeholder="50100123456789"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-ink-primary">Bank IFSC Code</label>
                      <input
                        type="text"
                        value={editIfsc}
                        onChange={(e) => setEditIfsc(e.target.value.toUpperCase())}
                        placeholder="HDFC0001234"
                        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-lg bg-[#FF5B00] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors disabled:opacity-50"
                  >
                    {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            )}

            {/* Sub-section 2: My Contracts */}
            {profileSubTab === "contracts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">All Campaign Contracts ({contracts.length})</h3>
                  <button
                    onClick={() => setCreateContractModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#FF5B00] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Contract</span>
                  </button>
                </div>

                {contracts.length === 0 ? (
                  <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                    No contracts created yet. Use the Create Contract button to initiate a new collaboration.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contracts.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-bold text-[#FF5B00]">{c.contract_number}</code>
                            <span className="rounded bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-white">
                              {c.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white">{c.title}</h4>
                          <p className="text-xs text-ink-muted">Client: {c.company_name || c.client_company}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-ink-muted block">Deal Value</span>
                            <span className="text-sm font-bold tabular-nums text-white">
                              ₹{Number(c.gross_amount_inr).toLocaleString("en-IN")}
                            </span>
                          </div>
                          {c.guest_sign_token && (
                            <button
                              onClick={() => {
                                setCreatedContractData({
                                  contractNumber: c.contract_number,
                                  publicSigningUrl: `${window.location.origin}/contracts/sign/${c.guest_sign_token}`,
                                  clientCompany: c.company_name || c.client_company,
                                  clientName: c.client_name,
                                  clientPhone: c.client_phone || "",
                                  clientEmail: c.client_email || "",
                                  grossAmount: c.gross_amount_inr,
                                  title: c.title,
                                  sha256Digest: c.sha256_digest
                                });
                                setContractShareModalOpen(true);
                              }}
                              className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
                            >
                              Share Sign Link
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-section 3: My Invoices */}
            {profileSubTab === "invoices" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Tax Invoices ({invoices.length})</h3>
                  <button
                    onClick={() => setCreateInvoiceModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#FF5B00] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Invoice</span>
                  </button>
                </div>

                {invoices.length === 0 ? (
                  <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-xs text-ink-muted">
                    No invoices generated yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="rounded-xl border border-border-subtle bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-bold text-[#FF5B00]">{inv.invoice_number}</code>
                            <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                              {inv.status}
                            </span>
                            {inv.is_standalone && (
                              <span className="rounded bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
                                Standalone
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-semibold text-white">{inv.company_name}</h4>
                          <p className="text-[11px] text-ink-muted">
                            {inv.contract_title} • {inv.service_description || "Creator Services"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
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
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-section 4: My Earnings */}
            {profileSubTab === "earnings" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                    <span className="text-xs text-ink-muted">Total Lifetime Earnings</span>
                    <div className="text-2xl font-bold tabular-nums text-emerald-400">
                      ₹{Number(stats.total_earnings_inr || 0).toLocaleString("en-IN")}
                    </div>
                    <span className="text-[11px] text-ink-secondary">Settled directly or via escrow</span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                    <span className="text-xs text-ink-muted">Currently in Escrow</span>
                    <div className="text-2xl font-bold tabular-nums text-[#FF5B00]">
                      ₹{Number(stats.locked_escrow_inr || 0).toLocaleString("en-IN")}
                    </div>
                    <span className="text-[11px] text-ink-secondary">Nodal bank escrow balance</span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-1">
                    <span className="text-xs text-ink-muted">Active Pipeline Deals</span>
                    <div className="text-2xl font-bold tabular-nums text-white">
                      {stats.active_deals || 0}
                    </div>
                    <span className="text-[11px] text-ink-secondary">In production or client review</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border-strong bg-surface p-6 space-y-3">
                  <h4 className="text-sm font-bold text-white">Escrow &amp; Payout Coordinates</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    All escrow payments released by agencies are disbursed directly into your registered bank account or UPI handle. You can update your payment coordinates in the Edit Profile tab.
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setProfileSubTab("profile")}
                      className="rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                    >
                      Update Payout Info
                    </button>
                    <button
                      onClick={() => setActiveTab("payments")}
                      className="rounded-lg border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
                    >
                      View Payouts Ledger
                    </button>
                  </div>
                </div>
              </div>
            )}
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
      {/* CREATOR NEGOTIATION THREAD MODAL (4.3) */}
      {/* ======================================================== */}
      {selectedContractForNegotiation && (
        <div data-ui="modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div data-ui="divider" className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div>
                <code className="text-xs text-[#FF5B00]">
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
                <span className="text-ink-muted block text-[11px]">Agreed Commercials:</span>
                <span className="font-bold text-white">
                  ₹{Number(selectedContractForNegotiation.gross_amount_inr).toLocaleString("en-IN")} (Advance: {selectedContractForNegotiation.advance_percent}%)
                </span>
              </div>
              <span className="rounded bg-[#FF5B00]/15 text-[#FF5B00] px-2 py-0.5 text-[10px] font-bold">
                Status: {selectedContractForNegotiation.status}
              </span>
            </div>

            {/* Messages Thread */}
            <div className="space-y-3 max-h-56 overflow-y-auto p-1">
              {negotiationsList.length === 0 ? (
                <div className="text-center text-xs text-ink-muted py-6">
                  No negotiation messages yet. You can submit your thoughts or a counter-rate below.
                </div>
              ) : (
                negotiationsList.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg p-3 text-xs space-y-1 ${
                      n.sender_role === "CREATOR"
                        ? "bg-[#FF5B00]/10 border border-[#FF5B00]/20 ml-6"
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

            {/* Counter offer & Message inputs */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Counter Rate (INR)</label>
                  <input
                    type="number"
                    value={counterGross}
                    onChange={(e) => setCounterGross(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
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
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-primary">Message to Agency</label>
                <input
                  type="text"
                  placeholder="e.g. My baseline for 1 reel + 2 shorts is ₹75,000 with 50% advance."
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleSendNegotiationMessage("REPLY")}
                  className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white hover:border-[#FF5B00]"
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
      {/* ======================================================== */}
      {/* CREATE CONTRACT MODAL */}
      {/* ======================================================== */}
      {createContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-ui="modal">
          <div className="w-full max-w-2xl rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div data-ui="divider" className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="text-xs font-semibold text-[#FF5B00] uppercase">New Campaign Proposal</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Create Collaboration Contract</h3>
                <p className="text-xs text-ink-secondary mt-1">
                  Draft a legally enforceable contract sealed with SHA-256. Clients can review and sign without logging in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateContractModalOpen(false)}
                className="text-ink-muted hover:text-white p-1"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-5">
              {/* Client Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-ink-primary">Recipient / Client Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContractClientType("EXTERNAL")}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      contractClientType === "EXTERNAL"
                        ? "border-[#FF5B00] bg-[#FF5B00]/10"
                        : "border-border-subtle bg-surface-elevated hover:border-border-strong"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">External Agency / Brand</span>
                    <span className="text-[11px] text-ink-secondary">Guest sign via link (no login needed)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContractClientType("REGISTERED")}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      contractClientType === "REGISTERED"
                        ? "border-[#FF5B00] bg-[#FF5B00]/10"
                        : "border-border-subtle bg-surface-elevated hover:border-border-strong"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">Registered CreateKar Agency</span>
                    <span className="text-[11px] text-ink-secondary">Pick from verified brand directory</span>
                  </button>
                </div>
              </div>

              {/* Registered Agency Picker */}
              {contractClientType === "REGISTERED" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-primary">Select Agency</label>
                  <select
                    value={contractAgencyId}
                    onChange={(e) => {
                      setContractAgencyId(e.target.value);
                      const agency = registeredAgencies.find((a) => a.id === e.target.value);
                      if (agency) {
                        setContractClientCompany(agency.company_name || agency.brand_name || agency.name);
                        setContractClientName(agency.name);
                        setContractClientEmail(agency.email);
                      }
                    }}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  >
                    <option value="">-- Choose an agency --</option>
                    {registeredAgencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.company_name || agency.brand_name || agency.name} ({agency.email})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* External Client Info */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Client Company / Brand Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nykaa, BoAt, Agency Delta"
                      value={contractClientCompany}
                      onChange={(e) => setContractClientCompany(e.target.value)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Client Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={contractClientName}
                      onChange={(e) => setContractClientName(e.target.value)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Client Email (For Link &amp; Records)</label>
                    <input
                      type="email"
                      placeholder="contact@brand.com"
                      value={contractClientEmail}
                      onChange={(e) => setContractClientEmail(e.target.value)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Client WhatsApp / Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={contractClientPhone}
                      onChange={(e) => setContractClientPhone(e.target.value)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Campaign Commercials */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Festive Launch: 1x Instagram Reel + 2x Stories"
                    value={contractTitle}
                    onChange={(e) => setContractTitle(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Campaign Scope &amp; Brief *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe deliverable expectations, product review terms, exclusivity, and timeline..."
                    value={contractBrief}
                    onChange={(e) => setContractBrief(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Gross Deal Value (INR) *</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={contractGross}
                      onChange={(e) => setContractGross(e.target.value)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Advance Escrow (%)</label>
                    <select
                      value={contractAdvancePercent}
                      onChange={(e) => setContractAdvancePercent(e.target.value)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    >
                      <option value="25">25% Advance</option>
                      <option value="50">50% Advance (Standard)</option>
                      <option value="75">75% Advance</option>
                      <option value="100">100% Upfront Escrow</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Payment Mode</label>
                    <select
                      value={contractPaymentMode}
                      onChange={(e) => setContractPaymentMode(e.target.value as any)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    >
                      <option value="ESCROW_RAZORPAY">Razorpay Nodal Escrow</option>
                      <option value="DIRECT_P2P">Direct UPI / P2P Settlement</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Deliverables List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Campaign Deliverables</span>
                  <button
                    type="button"
                    onClick={() =>
                      setContractDeliverables([
                        ...contractDeliverables,
                        { type: "Instagram Story", description: "2x Story frames with swipe-up link", deadline: "" }
                      ])
                    }
                    className="text-xs font-semibold text-[#FF5B00] hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Deliverable</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {contractDeliverables.map((deliv, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-elevated p-2.5 text-xs"
                    >
                      <input
                        type="text"
                        placeholder="Format (e.g. YouTube Video)"
                        value={deliv.type}
                        onChange={(e) => {
                          const updated = [...contractDeliverables];
                          updated[index].type = e.target.value;
                          setContractDeliverables(updated);
                        }}
                        className="w-1/3 rounded border border-border-subtle bg-surface px-2.5 py-1 text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Description of content"
                        value={deliv.description}
                        onChange={(e) => {
                          const updated = [...contractDeliverables];
                          updated[index].description = e.target.value;
                          setContractDeliverables(updated);
                        }}
                        className="w-2/3 rounded border border-border-subtle bg-surface px-2.5 py-1 text-white focus:outline-none"
                      />
                      {contractDeliverables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setContractDeliverables(contractDeliverables.filter((_, i) => i !== index));
                          }}
                          className="text-ink-muted hover:text-rose-400 p-1"
                          aria-label="Remove deliverable"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div data-ui="divider" className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setCreateContractModalOpen(false)}
                  className="rounded-lg border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-white hover:border-border-strong"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingContract}
                  className="rounded-lg bg-[#FF5B00] px-5 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors disabled:opacity-50"
                >
                  {creatingContract ? "Sealing Agreement..." : "Create Campaign Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONTRACT SHARE & GUEST SIGNING MODAL */}
      {/* ======================================================== */}
      {contractShareModalOpen && createdContractData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-ui="modal">
          <div className="w-full max-w-xl rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div data-ui="divider" className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Contract Agreement Ready to Share</span>
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {createdContractData.contractNumber}
                </h3>
                <p className="text-xs text-ink-secondary mt-1">
                  Client: {createdContractData.clientCompany} • Deal Value: ₹{Number(createdContractData.grossAmount).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContractShareModalOpen(false)}
                className="text-ink-muted hover:text-white p-1"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Explanation Banner */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 space-y-1 text-xs text-blue-200">
              <span className="font-semibold text-white block">Instant Guest Signing Active</span>
              <p>
                Your client can review and sign this agreement directly via the link below without creating a CreateKar account or logging in. Sealed under the IT Act 2000 (Section 10A).
              </p>
            </div>

            {/* Signing URL Copy Bar */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-primary">Public Signing Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdContractData.publicSigningUrl}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-ink-secondary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdContractData.publicSigningUrl);
                    toast.success("Signing link copied to clipboard!");
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] shrink-0 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Direct 1-Click Share Actions */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-ink-primary block">Quick Share via Channels</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={getContractWhatsAppShareUrl(
                    createdContractData.publicSigningUrl,
                    createdContractData.clientName || createdContractData.clientCompany,
                    createdContractData.title || "Campaign",
                    createdContractData.grossAmount
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share on WhatsApp</span>
                </a>

                <a
                  href={`mailto:${createdContractData.clientEmail}?subject=${encodeURIComponent(
                    `CreateKar Agreement: ${createdContractData.title || "Creator Collaboration"}`
                  )}&body=${encodeURIComponent(
                    `Hi ${createdContractData.clientName || "Partner"},\n\nPlease review and sign our campaign contract on CreateKar: ${createdContractData.publicSigningUrl}\n\nTerms are sealed with SHA-256 and no login is required.\n\nThank you!`
                  )}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-elevated px-4 py-2.5 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send via Email</span>
                </a>
              </div>
            </div>

            <div data-ui="divider" className="flex items-center justify-end pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setContractShareModalOpen(false)}
                className="rounded-lg bg-surface-elevated border border-border-subtle px-5 py-2 text-xs font-semibold text-white hover:border-border-strong"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE INVOICE MODAL (Contract-Linked vs Standalone) */}
      {/* ======================================================== */}
      {createInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-ui="modal">
          <div className="w-full max-w-2xl rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div data-ui="divider" className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="text-xs font-semibold text-[#FF5B00] uppercase">Tax Invoice Generator</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Generate GST Tax Invoice</h3>
                <p className="text-xs text-ink-secondary mt-1">
                  Issue compliant B2B invoices with SAC code 998311 and automated 18% GST (CGST + SGST).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateInvoiceModalOpen(false)}
                className="text-ink-muted hover:text-white p-1"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-5">
              {/* Source Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-ink-primary">Invoice Foundation</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInvoiceSource("CONTRACT")}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      invoiceSource === "CONTRACT"
                        ? "border-[#FF5B00] bg-[#FF5B00]/10"
                        : "border-border-subtle bg-surface-elevated hover:border-border-strong"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">From Existing Contract (Recommended)</span>
                    <span className="text-[11px] text-ink-secondary">Pre-fills terms &amp; locks agreed rate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvoiceSource("STANDALONE")}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      invoiceSource === "STANDALONE"
                        ? "border-[#FF5B00] bg-[#FF5B00]/10"
                        : "border-border-subtle bg-surface-elevated hover:border-border-strong"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">Standalone Freelance Invoice</span>
                    <span className="text-[11px] text-ink-secondary">Direct billing without contract</span>
                  </button>
                </div>
              </div>

              {/* Standalone Anti-Slop Upsell Banner */}
              {invoiceSource === "STANDALONE" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1 text-xs text-amber-200" data-ui="callout">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Sparkles className="h-4 w-4 text-[#FF5B00]" />
                    <span>CreateKar Pro-Tip: Contract-Backed Billing</span>
                  </div>
                  <p>
                    CreateKar can make the finest invoices based on contracts! Linking invoices to contracts gives you advance escrow deposits, milestone tracking, and automated CBDT TDS accounting. Try the contracts feature next time if you like!
                  </p>
                </div>
              )}

              {/* Contract Selector if CONTRACT mode */}
              {invoiceSource === "CONTRACT" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-primary">Select Active Campaign Contract *</label>
                  <select
                    required
                    value={invoiceContractId}
                    onChange={(e) => handleSelectContractForInvoice(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  >
                    <option value="">-- Choose a contract to invoice --</option>
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.contract_number} • {c.title} (₹{Number(c.gross_amount_inr).toLocaleString("en-IN")}) - {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Client & Billing Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Billed To (Company / Client Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Marketing Pvt Ltd"
                    value={invoiceClientCompany}
                    onChange={(e) => setInvoiceClientCompany(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Client Contact Representative</label>
                  <input
                    type="text"
                    placeholder="e.g. Ananya Sen"
                    value={invoiceClientName}
                    onChange={(e) => setInvoiceClientName(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Client Email (For Delivery)</label>
                  <input
                    type="email"
                    placeholder="finance@client.com"
                    value={invoiceClientEmail}
                    onChange={(e) => setInvoiceClientEmail(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Client GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="27AABCB1234F1Z1"
                    value={invoiceClientGstin}
                    onChange={(e) => setInvoiceClientGstin(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-primary">Client Billing Address</label>
                <textarea
                  rows={2}
                  placeholder="Official office address printed on the invoice..."
                  value={invoiceClientAddress}
                  onChange={(e) => setInvoiceClientAddress(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                />
              </div>

              {/* Service Details & Commercials */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-primary">Description of Service</label>
                  <input
                    type="text"
                    value={invoiceServiceDesc}
                    onChange={(e) => setInvoiceServiceDesc(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">Taxable Value (INR) *</label>
                    <input
                      type="number"
                      required
                      min={500}
                      value={invoiceTaxableValue}
                      onChange={(e) => setInvoiceTaxableValue(e.target.value)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">SAC Code</label>
                    <input
                      type="text"
                      value={invoiceSacCode}
                      onChange={(e) => setInvoiceSacCode(e.target.value)}
                      className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink-primary">GST (18% Total)</label>
                    <div className="rounded-lg border border-border-subtle bg-surface-elevated/60 px-3 py-2 text-xs text-ink-secondary">
                      ₹{Math.round((Number(invoiceTaxableValue) || 0) * 0.18).toLocaleString("en-IN")} (9% + 9%)
                    </div>
                  </div>
                </div>

                {/* Total Preview */}
                <div className="rounded-xl border border-border-strong bg-surface-elevated p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Grand Total with 18% GST:</span>
                  <span className="text-base font-bold tabular-nums text-[#FF5B00]">
                    ₹{Math.round((Number(invoiceTaxableValue) || 0) * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div data-ui="divider" className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setCreateInvoiceModalOpen(false)}
                  className="rounded-lg border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-white hover:border-border-strong"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingInvoice}
                  className="rounded-lg bg-[#FF5B00] px-5 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors disabled:opacity-50"
                >
                  {creatingInvoice ? "Generating Tax Invoice..." : "Generate Tax Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INVOICE SHARE & UPSELL MODAL */}
      {/* ======================================================== */}
      {invoiceShareModalOpen && createdInvoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" data-ui="modal">
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div data-ui="divider" className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Invoice Successfully Generated</span>
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {createdInvoiceData.invoiceNumber}
                </h3>
                <p className="text-xs text-ink-secondary mt-1">
                  Total Payable: ₹{Number(createdInvoiceData.totalInr).toLocaleString("en-IN")} (incl. 18% GST)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceShareModalOpen(false)}
                className="text-ink-muted hover:text-white p-1"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* If Standalone: Prompt Contract feature */}
            {createdInvoiceData.isStandalone && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs text-amber-200" data-ui="callout">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-[#FF5B00]" />
                  <span>Contract Feature Recommendation</span>
                </div>
                <p>
                  CreateKar can make the finest invoices based on contracts, try the contracts feature next time if you like! Contracts secure your advance escrow and handle compliance automatically.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceShareModalOpen(false);
                      setCreateContractModalOpen(true);
                    }}
                    className="rounded-lg bg-surface border border-border-subtle px-3 py-1.5 text-xs font-semibold text-white hover:border-[#FF5B00] transition-colors"
                  >
                    Try Contracts Feature Now
                  </button>
                </div>
              </div>
            )}

            {/* Direct 1-Click WhatsApp Share */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-ink-primary block">Share with Client</span>
              <a
                href={getInvoiceWhatsAppShareUrl(
                  createdInvoiceData.invoiceNumber,
                  invoiceClientCompany || "Partner",
                  createdInvoiceData.totalInr
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors w-full"
              >
                <Share2 className="h-4 w-4" />
                <span>Send Invoice Reminder on WhatsApp</span>
              </a>
            </div>

            <div data-ui="divider" className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setInvoiceShareModalOpen(false)}
                className="rounded-lg bg-surface-elevated border border-border-subtle px-5 py-2 text-xs font-semibold text-white hover:border-border-strong"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
