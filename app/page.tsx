"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck,
  FileCheck,
  Zap,
  ArrowRight,
  Check,
  Award,
  Users,
  Building2,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";
import { DealSimulator } from "@/components/DealSimulator";
import { toast } from "sonner";

export default function Home() {
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryRole, setInquiryRole] = useState<"creator" | "agency">("creator");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [activeNiche, setActiveNiche] = useState<string>("all");

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail || !inquiryEmail.includes("@")) {
      toast.error("Please enter a valid business email address.");
      return;
    }
    setInquirySubmitted(true);
    toast.success("Access request received. You are queued for priority onboarding.");
  };

  const sampleCreators = [
    {
      name: "Rohan Varma",
      handle: "@rohan_tech",
      niche: "Tech & AI",
      followers: "420K",
      rate: "₹65,000",
      badge: "Famous Creator",
      badgeType: "famous",
      boosted: true,
      deliverables: "1 Dedicated Video + 2 Shorts",
    },
    {
      name: "Pooja Hegde Media",
      handle: "@poojalifestyle",
      niche: "Lifestyle & Travel",
      followers: "1.2M",
      rate: "₹1,80,000",
      badge: "Famous Creator",
      badgeType: "famous",
      boosted: true,
      deliverables: "1 Reel + 3 Story Sequence",
    },
    {
      name: "Aditya Finance",
      handle: "@aditya_ledger",
      niche: "Fintech & Crypto",
      followers: "280K",
      rate: "₹45,000",
      badge: "Verified Creator",
      badgeType: "verified",
      boosted: false,
      deliverables: "1 In-depth Explainer Reel",
    },
    {
      name: "Simran Kaur",
      handle: "@simran_fit",
      niche: "Fitness & Nutrition",
      followers: "190K",
      rate: "₹35,000",
      badge: "Verified Creator",
      badgeType: "verified",
      boosted: false,
      deliverables: "2 Reels + Brand Tagged Link",
    },
  ];

  const filteredCreators =
    activeNiche === "all"
      ? sampleCreators
      : sampleCreators.filter((c) =>
          c.niche.toLowerCase().includes(activeNiche.toLowerCase())
        );

  return (
    <div className="space-y-24 py-12 md:py-16">
      {/* 1. HERO SECTION (Item 4: CTA above the fold, 5-word headline, zero slop) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-1.5 text-xs text-ink-secondary">
            <span className="h-2 w-2 rounded-full bg-status-success" />
            <span className="font-semibold text-ink-primary">
              Live Escrow Engine • India Edition
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-ink-primary sm:text-6xl lg:text-7xl leading-[1.08]">
            The Sovereign Creator Contract Ledger.
          </h1>

          <p className="max-w-2xl text-lg text-ink-secondary leading-relaxed">
            Eliminate payment delays, brief ambiguities, and contract disputes. CreateKar pairs
            RBI-compliant milestone escrow with Aadhaar digital signatures and automated GST invoicing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/signup?role=agency"
              className="inline-flex items-center gap-2 rounded-md bg-brand-gold px-6 py-3.5 text-sm font-semibold text-black hover:bg-brand-gold-light active:scale-95 transition-transform"
            >
              <span>Explore Verified Creators</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup?role=creator"
              className="rounded-md border border-border-subtle bg-surface px-6 py-3.5 text-sm font-semibold text-ink-primary hover:border-border-strong transition-colors"
            >
              Join as Creator
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-6 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-gold" />
              <span className="text-ink-secondary">Nodal Bank Escrow</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-brand-gold" />
              <span className="text-ink-secondary">Aadhaar e-Signed Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-gold" />
              <span className="text-ink-secondary">Instant GST Tax Invoices</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE DEAL SIMULATOR (Marked data-ui for interface fragment rules) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-ui>
        <DealSimulator />
      </section>

      {/* 3. VERIFIED CREATOR ROSTER PREVIEW (Agency side view) */}
      <section id="roster" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8" data-ui>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <span className="text-xs font-semibold text-brand-gold">
              Agency Marketplace
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-ink-primary">
              Pre-Vetted Creator Directory
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Agency Pro and Enterprise plans provide verified commercial rate cards and direct deal initiation.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {["all", "tech", "lifestyle", "fintech", "fitness"].map((category) => (
              <button
                key={category}
                onClick={() => setActiveNiche(category)}
                className={`capitalize rounded-md border px-3 py-1.5 font-medium transition-colors ${
                  activeNiche === category
                    ? "border-brand-gold bg-brand-gold/15 text-brand-gold"
                    : "border-border-subtle bg-surface text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCreators.map((creator) => (
            <div
              key={creator.handle}
              className="relative flex flex-col justify-between rounded-xl border border-border-subtle bg-surface p-5 hover:border-border-strong transition-colors"
            >
              {creator.boosted && (
                <div className="absolute -top-2.5 right-4 rounded bg-brand-gold px-2 py-0.5 text-[10px] font-bold text-black uppercase">
                  7D Boost Active
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-elevated text-sm font-bold text-brand-gold border border-border-strong">
                    {creator.name.charAt(0)}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                      creator.badgeType === "famous"
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                        : "bg-blue-400/20 text-blue-300 border border-blue-400/30"
                    }`}
                  >
                    <Award className="h-3 w-3" />
                    <span>{creator.badge}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-ink-primary">{creator.name}</h3>
                  <p className="text-xs text-ink-muted">{creator.handle}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
                  <div>
                    <span className="text-ink-muted text-[11px] block">Niche</span>
                    <span className="font-medium text-ink-secondary">{creator.niche}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted text-[11px] block">Followers</span>
                    <span className="font-medium tabular-nums text-ink-primary">
                      {creator.followers}
                    </span>
                  </div>
                </div>

                <div className="rounded border border-border-subtle bg-surface-elevated p-2 text-xs">
                  <span className="text-[10px] text-ink-muted block uppercase">
                    Standard Scope
                  </span>
                  <span className="text-ink-secondary text-[11px] font-medium">
                    {creator.deliverables}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase block">
                    Starting At
                  </span>
                  <span className="text-sm font-bold tabular-nums text-ink-primary">
                    {creator.rate}
                  </span>
                </div>
                <Link
                  href="/login"
                  className="rounded bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-ink-primary hover:border-brand-gold border border-border-subtle transition-colors"
                >
                  Propose Deal
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ESCROW & DEAL PROTOCOL (4-step lifecycle) */}
      <section id="protocol" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold text-brand-gold">
            Protocol Architecture
          </span>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
            How Sovereign Deal Flow Works
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            A linear trust chain ensuring zero creative ghosting for agencies and zero payment chasing for creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-3">
            <div className="text-xs text-brand-gold font-bold">STAGE 01</div>
            <h3 className="text-base font-semibold text-ink-primary">Brief &amp; Negotiate</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Agency outlines deliverables and deadline. Creator accepts or counters with revised rates and advance split.
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-3">
            <div className="text-xs text-brand-gold font-bold">STAGE 02</div>
            <h3 className="text-base font-semibold text-ink-primary">Aadhaar e-Sign &amp; Escrow</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Legally binding contract executed with OTP. Agency funds agreed advance into the RBI-regulated nodal vault.
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-3">
            <div className="text-xs text-brand-gold font-bold">STAGE 03</div>
            <h3 className="text-base font-semibold text-ink-primary">Deliverable Portal</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Creator uploads video drafts and proofs. Agency has 5 days to approve or request defined revisions.
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-3">
            <div className="text-xs text-brand-gold font-bold">STAGE 04</div>
            <h3 className="text-base font-semibold text-ink-primary">T+0 Payout &amp; GST</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Deliverable approval automatically triggers instant escrow payout. Tax invoice is issued with statutory compliance.
            </p>
          </div>
        </div>
      </section>

      {/* 5. MONETIZATION PRICING GRID (Creator Tiers & Agency Tiers) */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-brand-gold">
            Transparent Monetization
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
            Plans for Creators &amp; Agencies
          </h2>
          <p className="text-sm text-ink-secondary">
            No hidden cuts. Pure utility and trust infrastructure tailored for the Indian creator market.
          </p>
        </div>

        {/* Creator Plans */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-3">
            <Users className="h-5 w-5 text-brand-gold" />
            <h3 className="text-lg font-bold text-ink-primary">Creator Monetization Tiers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Creator */}
            <div className="rounded-xl border border-border-subtle bg-surface p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-ink-muted">Starting Tier</span>
                <h4 className="text-xl font-bold text-ink-primary">Basic Creator</h4>
                <div className="flex items-baseline gap-1">
                  <span className="tabular-nums text-3xl font-extrabold text-ink-primary">₹0</span>
                  <span className="text-xs text-ink-muted">/ forever free</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Essential tools for independent creators starting out.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Free GST invoices (with CreateKar watermark)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>5 Free contracts (₹199 per contract after)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>7-day free trial boost in Explore Tab</span>
                  </li>
                  <li className="flex items-center gap-2 text-ink-muted">
                    <span className="text-[11px]">₹599 renewal for subsequent 7-day boosts</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?role=creator&plan=basic"
                className="mt-8 block text-center rounded-md border border-border-subtle bg-surface-elevated py-2.5 text-xs font-semibold text-ink-primary hover:border-border-strong transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Creator Pro */}
            <div className="relative rounded-xl border border-brand-gold bg-surface-elevated p-6 flex flex-col justify-between">
              <div className="absolute -top-3 right-6 rounded bg-brand-gold px-3 py-0.5 text-[10px] font-bold text-black uppercase">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-semibold text-brand-gold">Pro Status</span>
                <h4 className="text-xl font-bold text-ink-primary">Creator Pro</h4>
                <div className="flex items-baseline gap-1">
                  <span className="tabular-nums text-3xl font-extrabold text-brand-gold">₹999</span>
                  <span className="text-xs text-ink-muted">/ month</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Full credibility badge and automated payment reminders.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2 font-medium text-ink-primary">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>&quot;Verified Creator&quot; Badge on profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>1-click payment due reminders on WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>1 Month boost in agency Explore tab</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>10 Free contracts with Aadhaar e-signs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Priority resolution support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?role=creator&plan=pro"
                className="mt-8 block text-center rounded-md bg-brand-gold py-2.5 text-xs font-semibold text-black hover:bg-brand-gold-light transition-transform active:scale-95"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Influencer Tier */}
            <div className="rounded-xl border border-border-subtle bg-surface p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-amber-400">Top 1% Creators</span>
                <h4 className="text-xl font-bold text-ink-primary">Influencer</h4>
                <div className="flex items-baseline gap-1">
                  <span className="tabular-nums text-3xl font-extrabold text-ink-primary">₹4,999</span>
                  <span className="text-xs text-ink-muted">/ month</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  White-labeled operations, tax management, and international visibility.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2 font-medium text-amber-300">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>&quot;Famous Creator&quot; Golden Badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>GST Invoices WITHOUT watermark</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Unlimited contracts with Aadhaar e-signs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>ITR Filing assistance &amp; CA consultation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Global agency &amp; international collab visibility</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?role=creator&plan=influencer"
                className="mt-8 block text-center rounded-md border border-border-subtle bg-surface-elevated py-2.5 text-xs font-semibold text-ink-primary hover:border-border-strong transition-colors"
              >
                Join Influencer Desk
              </Link>
            </div>
          </div>
        </div>

        {/* Agency Plans */}
        <div className="space-y-6 pt-8">
          <div className="flex items-center gap-2 pb-3">
            <Building2 className="h-5 w-5 text-brand-gold" />
            <h3 className="text-lg font-bold text-ink-primary">Agency &amp; Brand Tiers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Agency */}
            <div className="rounded-xl border border-border-subtle bg-surface p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-ink-muted">Brand Starter</span>
                <h4 className="text-xl font-bold text-ink-primary">Basic Agency</h4>
                <div className="flex items-baseline gap-1">
                  <span className="tabular-nums text-3xl font-extrabold text-ink-primary">₹0</span>
                  <span className="text-xs text-ink-muted">/ pay per deal</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  For brands initiating occasional creator deals.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>View up to 5 creators in Explore tab</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>GST compatibility &amp; B2B invoice generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Pay escrow via Card, NetBanking &amp; UPI</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?role=agency&plan=basic"
                className="mt-8 block text-center rounded-md border border-border-subtle bg-surface-elevated py-2.5 text-xs font-semibold text-ink-primary hover:border-border-strong transition-colors"
              >
                Create Agency Account
              </Link>
            </div>

            {/* Agency Pro */}
            <div className="rounded-xl border border-border-strong bg-surface-elevated p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-brand-gold">Growth Agencies</span>
                <h4 className="text-xl font-bold text-ink-primary">Agency Pro</h4>
                <div className="flex items-baseline gap-1">
                  <span className="tabular-nums text-3xl font-extrabold text-brand-gold">₹4,999</span>
                  <span className="text-xs text-ink-muted">/ month</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  For active marketing teams running multi-creator sprints.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2 font-medium text-ink-primary">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>View up to 10 creators in Explore tab</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Aadhaar e-Signed legal agreements included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>1-Click automated WhatsApp reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Custom deliverable milestone checklists</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?role=agency&plan=pro"
                className="mt-8 block text-center rounded-md bg-brand-gold py-2.5 text-xs font-semibold text-black hover:bg-brand-gold-light transition-transform active:scale-95"
              >
                Get Agency Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-xl border border-border-subtle bg-surface p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-ink-muted">Scale &amp; Media Houses</span>
                <h4 className="text-xl font-bold text-ink-primary">Enterprise</h4>
                <div className="flex items-baseline gap-1">
                  <span className="tabular-nums text-3xl font-extrabold text-ink-primary">₹14,999</span>
                  <span className="text-xs text-ink-muted">/ month</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  High volume campaign management with custom legal governance.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-ink-secondary">
                  <li className="flex items-center gap-2 font-medium text-ink-primary">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>View up to 50 creators in Explore tab</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Dedicated Campaign Account Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Priority WhatsApp blast for emergency briefs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-gold shrink-0" />
                    <span>Multi-seat access for media planner teams</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?role=agency&plan=enterprise"
                className="mt-8 block text-center rounded-md border border-border-subtle bg-surface-elevated py-2.5 text-xs font-semibold text-ink-primary hover:border-border-strong transition-colors"
              >
                Contact Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRIORITY INQUIRY / ACCESS FORM (Checklist 13: Form error states & feedback) */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border-strong bg-surface-elevated p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border-strong text-brand-gold mx-auto">
            <Sparkles className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-primary">
              Ready to execute campaigns with sovereign escrow?
            </h2>
            <p className="text-sm text-ink-secondary max-w-lg mx-auto">
              Join over 1,400+ verified Indian creators and leading performance marketing agencies.
            </p>
          </div>

          {inquirySubmitted ? (
            <div className="rounded-lg border border-status-success/30 bg-status-success/10 p-6 text-sm text-status-success max-w-md mx-auto space-y-2">
              <CheckCircle2 className="h-6 w-6 mx-auto" />
              <p className="font-semibold">Priority Verification Initiated</p>
              <p className="text-xs text-ink-secondary">
                We sent a validation magic link to {inquiryEmail}. Please check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex rounded-lg border border-border-subtle bg-surface p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setInquiryRole("creator")}
                  className={`flex-1 rounded py-1.5 font-medium transition-colors ${
                    inquiryRole === "creator"
                      ? "bg-brand-gold text-black font-semibold"
                      : "text-ink-muted hover:text-ink-primary"
                  }`}
                >
                  I am a Creator
                </button>
                <button
                  type="button"
                  onClick={() => setInquiryRole("agency")}
                  className={`flex-1 rounded py-1.5 font-medium transition-colors ${
                    inquiryRole === "agency"
                      ? "bg-brand-gold text-black font-semibold"
                      : "text-ink-muted hover:text-ink-primary"
                  }`}
                >
                  I am an Agency / Brand
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter business email..."
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  className="flex-1 rounded-md border border-border-subtle bg-surface px-4 py-2.5 text-xs text-ink-primary focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-gold px-4 py-2.5 text-xs font-semibold text-black hover:bg-brand-gold-light active:scale-95 transition-transform"
                >
                  <span>Request Creator Access</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-ink-muted">
                Zero spam. Strict adherence to DPDP Act 2023 consent standards.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
