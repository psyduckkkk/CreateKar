"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  Award
} from "lucide-react";
import { CreateKarLogo } from "@/components/CreateKarLogo";

export default function GuestContractSigningPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Signatory form
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryDesignation, setSignatoryDesignation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [updatedSha256, setUpdatedSha256] = useState("");

  useEffect(() => {
    async function fetchContract() {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/contracts/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || "Unable to load contract. The link may have expired.");
          return;
        }
        setContractData(data.contract);
        setCompanyName(data.contract.clientCompany || "");
        setSignatoryName(data.contract.clientName || "");
        if (data.contract.status === "ACCEPTED" || data.contract.agencySignedAt) {
          setSignedSuccess(true);
          setUpdatedSha256(data.contract.sha256Digest);
        }
      } catch {
        setErrorMessage("Network error loading contract. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchContract();
  }, [token]);

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatoryName.trim()) return;

    try {
      setSigning(true);
      const res = await fetch(`/api/public/contracts/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatory_name: signatoryName.trim(),
          signatory_designation: signatoryDesignation.trim(),
          company_name: companyName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to sign contract.");
        return;
      }

      setSignedSuccess(true);
      setUpdatedSha256(data.sha256Digest);
    } catch {
      alert("Error submitting signature. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-xs text-ink-muted">
        Loading legal agreement for review...
      </div>
    );
  }

  if (errorMessage || !contractData) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-full max-w-md rounded-2xl border border-border-strong bg-surface p-8 space-y-4">
          <h2 className="text-base font-bold text-white">Agreement Unavailable</h2>
          <p className="text-xs text-ink-secondary">{errorMessage}</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-surface-elevated border border-border-subtle px-4 py-2 text-xs font-semibold text-white hover:border-[#1D62EA]"
          >
            Return to CreateKar Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-ink-primary" data-ui="guest-signing-page">
      {/* Top Header */}
      <header className="border-b border-border-subtle bg-surface/90" data-ui="guest-header">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <CreateKarLogo size="md" />
            <span className="hidden sm:inline text-xs text-ink-muted">
              • Secure Guest Signing Portal
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Encrypted SHA-256 Record</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        {/* Banner Notice */}
        <div className="rounded-xl border border-[#1D62EA]/30 bg-[#1D62EA]/10 p-4 text-xs text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold text-white block">
              You have been invited by {contractData.creator?.name} to review and sign this agreement.
            </span>
            <p className="text-blue-200/80">
              No account required. Once signed, terms are sealed under the Indian Information Technology Act (Section 10A).
            </p>
          </div>
          <span className="rounded bg-[#1D62EA] text-white px-3 py-1 text-[11px] font-semibold shrink-0">
            Guest Signer Mode
          </span>
        </div>

        {/* Contract Summary Box */}
        <div className="rounded-2xl border border-border-strong bg-surface p-6 sm:p-8 space-y-6">
          <div data-ui="divider" className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border-subtle pb-5">
            <div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-[#1D62EA] font-semibold">{contractData.contractNumber}</code>
                <span className="text-xs text-ink-muted">• Campaign Collaboration Agreement</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {contractData.title}
              </h1>
              <p className="text-xs text-ink-muted mt-1">
                Initiated on: {new Date(contractData.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
            </div>

            <div className="text-right">
              <span
                className={`rounded px-3 py-1 text-xs font-semibold ${
                  signedSuccess
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-amber-400/10 text-amber-300"
                }`}
              >
                {signedSuccess ? "Status: ACCEPTED & SEALED" : "Status: AWAITING SIGNATURE"}
              </span>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4 space-y-1">
              <span className="text-[11px] text-ink-muted font-semibold block">Creator / Freelancer</span>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{contractData.creator?.name}</h4>
                {contractData.creator?.badgeType === "verified" && (
                  <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                    <Award className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-[#1D62EA] block">{contractData.creator?.niche}</span>
              {(contractData.creator?.instagramHandle || contractData.creator?.youtubeHandle) && (
                <span className="text-ink-muted block text-[11px] pt-1">
                  Handles: {contractData.creator?.instagramHandle || contractData.creator?.youtubeHandle}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4 space-y-1">
              <span className="text-[11px] text-ink-muted font-semibold block">Client / Agency</span>
              <h4 className="text-sm font-bold text-white">
                {contractData.clientCompany || "Client Organization"}
              </h4>
              <span className="text-xs text-ink-secondary block">
                Representative: {contractData.clientName || "Agency Signatory"}
              </span>
              {contractData.clientEmail && (
                <span className="text-ink-muted block text-[11px] pt-1">
                  Email: {contractData.clientEmail}
                </span>
              )}
            </div>
          </div>

          {/* Campaign Brief */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-white block">Campaign Scope of Work &amp; Brief:</span>
            <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4 leading-relaxed text-ink-secondary">
              {contractData.campaignBrief}
            </div>
          </div>

          {/* Deliverables Checklist */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-white block">Scheduled Deliverables:</span>
            <div className="space-y-2">
              {contractData.deliverables?.map((d: any) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-border-subtle bg-surface-elevated p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <h5 className="font-bold text-white">{d.type}</h5>
                    <p className="text-ink-secondary text-[11px]">{d.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-ink-muted" />
                    <span>Due: {new Date(d.deadline).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Terms Breakdown */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-white block">Commercial &amp; Settlement Terms:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-surface-elevated p-3">
                <span className="text-[10px] text-ink-muted block">Gross Deal Value</span>
                <span className="text-base font-bold tabular-nums text-white">
                  ₹{Number(contractData.grossAmountInr).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="rounded-lg bg-surface-elevated p-3">
                <span className="text-[10px] text-ink-muted block">Advance Payment</span>
                <span className="text-base font-bold tabular-nums text-[#FF5B00]">
                  ₹{Number(contractData.advanceAmountInr).toLocaleString("en-IN")} ({contractData.advancePercent}%)
                </span>
              </div>
              <div className="rounded-lg bg-surface-elevated p-3">
                <span className="text-[10px] text-ink-muted block">Balance on Delivery</span>
                <span className="text-base font-bold tabular-nums text-white">
                  ₹{Number(contractData.balanceAmountInr).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="rounded-lg bg-surface-elevated p-3">
                <span className="text-[10px] text-ink-muted block">TDS Deduction</span>
                <span className="text-base font-bold tabular-nums text-ink-secondary">
                  {contractData.tdsSection !== "NONE" ? `₹${contractData.tdsAmountInr} (${contractData.tdsSection})` : "Exempt (₹0)"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-surface-elevated p-3 text-xs">
              <span className="text-ink-secondary">Payment &amp; Escrow Mode:</span>
              <strong className="text-white">
                {contractData.paymentMode === "ESCROW_RAZORPAY"
                  ? "CreateKar Razorpay Route Nodal Escrow"
                  : "Direct P2P UPI / Bank Transfer"}
              </strong>
            </div>
          </div>

          {/* Cryptographic SHA-256 Seal Tag */}
          <code className="block rounded border border-border-subtle bg-surface-elevated/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-ink-muted gap-2">
            <span className="truncate max-w-md">SHA-256: {updatedSha256 || contractData.sha256Digest}</span>
            <span className="text-emerald-400 flex items-center gap-1 shrink-0 font-sans font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Sealed under IT Act §10A
            </span>
          </code>

          {/* Signatory Acceptance Form or Signed Card */}
          {signedSuccess ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Agreement Successfully Signed &amp; Sealed!</h3>
                <p className="text-xs text-emerald-200">
                  {contractData.creator?.name} has been notified. The contract terms are locked and tamper-proof.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#1D62EA] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  Create Agency Account on CreateKar
                </Link>
                <Link
                  href="/"
                  className="rounded-lg border border-border-subtle bg-surface px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-white"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignContract} className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 space-y-4">
              <div data-ui="divider" className="border-b border-border-subtle pb-3">
                <h3 className="text-sm font-bold text-white">Signatory Authorization</h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Confirm your legal identity to execute this bilateral agreement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-ink-primary">Signatory Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Singhania"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-ink-primary">Designation / Role in Company</label>
                  <input
                    type="text"
                    placeholder="e.g. VP Brand Marketing / Founder"
                    value={signatoryDesignation}
                    onChange={(e) => setSignatoryDesignation(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-medium text-ink-primary">Organization / Client Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nexus Media Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs text-white focus:border-[#1D62EA] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={signing}
                  className="rounded-lg bg-[#FF5B00] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] disabled:opacity-50 transition-colors"
                >
                  {signing ? "Executing SHA-256 Seal..." : "Sign & Accept Agreement (SHA-256)"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
