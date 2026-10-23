"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck,
  FileCheck,
  Check,
  ArrowRight,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  ChevronDown,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { CreateKarLogo } from "@/components/CreateKarLogo";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"creator" | "agency">("creator");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does payment protection work?",
      a: "When a brand starts a campaign, their payment is safely deposited into a secure, bank-monitored account. The creator knows the money is real and guaranteed before filming. Once the brand reviews and approves the deliverable, the money is instantly sent to the creator's bank account.",
    },
    {
      q: "Do creators need a registered company or GST number?",
      a: "No. Individual creators can sign up with just their PAN and bank account details. If you have a GST number, CreateKar automatically generates formal B2B GST tax invoices for you so brands can claim input tax credit.",
    },
    {
      q: "How do contracts get signed?",
      a: "Contracts are completely digital. You review the deliverables, dates, and payment terms on your phone, then sign securely with an OTP in less than 2 minutes. No printing, scanning, or legal jargon.",
    },
    {
      q: "What if there is a disagreement on the deliverables?",
      a: "Contracts clearly state how many revisions are included. If a disagreement happens, funds stay securely held in bank protection while our support team steps in within 24 hours to help both sides reach a fair resolution.",
    },
  ];

  return (
    <div className="space-y-24 py-12 md:py-16">
      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-1.5 text-xs text-ink-secondary hover:border-[#FF5B00]/40 transition-[border-color] duration-200">
            <span className="h-2 w-2 rounded-full bg-[#FF5B00]" />
            <span className="font-medium text-ink-primary">
              Creator Collaborations &amp; Payment Protection in India
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
            Create content freely. Get paid safely.
          </h1>

          <p className="max-w-2xl text-lg text-ink-secondary leading-relaxed">
            Stop chasing unpaid invoices on WhatsApp and dealing with endless revisions.
            CreateKar protects advance payments in a safe bank hold, signs digital agreements in 2 minutes,
            and sends money to your bank the moment work is approved.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/signup?role=creator"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF5B00] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#ff6c1a] active:scale-95 transition-transform"
            >
              <span>Get Started as Creator</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup?role=agency"
              className="rounded-lg border border-border-subtle bg-surface px-6 py-3.5 text-sm font-semibold text-ink-primary hover:border-border-strong hover:bg-surface-elevated transition-colors"
            >
              I am a Brand or Agency
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-ink-secondary">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#FF5B00] shrink-0" />
              <span>100% Advance Payment Safety</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#1D62EA] shrink-0" />
              <span>2-Minute Phone OTP Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#FF5B00] shrink-0" />
              <span>Instant GST Invoices</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE OLD WAY VS THE CREATEKAR WAY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border-strong bg-surface p-6 sm:p-10">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Why creator deals break down today
            </h2>
            <p className="text-sm text-ink-secondary">
              Most creator campaigns in India run on messy WhatsApp chats and unwritten promises.
              Here is how CreateKar fixes it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Messy Old Way */}
            <div className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-status-error font-semibold text-sm">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>The Frustrating Way (WhatsApp &amp; DMs)</span>
              </div>
              <ul className="space-y-3 text-xs text-ink-secondary leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-status-error font-bold mt-0.5">•</span>
                  <span>Waiting 60 to 90 days after posting a video, wondering when payment will arrive.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-status-error font-bold mt-0.5">•</span>
                  <span>Awkward WhatsApp messages: &quot;Sir, accounts team ne approve kiya kya?&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-status-error font-bold mt-0.5">•</span>
                  <span>Endless unpaid revision requests because scope was never written down.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-status-error font-bold mt-0.5">•</span>
                  <span>Brands stress about creator ghosting after paying an advance.</span>
                </li>
              </ul>
            </div>

            {/* The CreateKar Way */}
            <div className="rounded-xl border border-[#FF5B00]/40 bg-surface-elevated p-6 space-y-4 relative hover:-translate-y-1 hover:border-[#FF5B00]/70 transition-[transform,border-color] duration-200">
              <div className="flex items-center gap-2 text-[#FF5B00] font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>The CreateKar Way (Safe &amp; Professional)</span>
              </div>
              <ul className="space-y-3 text-xs text-ink-primary leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#FF5B00] shrink-0 mt-0.5" />
                  <span><strong>Advance safely protected:</strong> Money is in a safe bank account before filming starts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#FF5B00] shrink-0 mt-0.5" />
                  <span><strong>Clear 2-minute contract:</strong> Number of deliverables, deadlines, and revisions are locked.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#FF5B00] shrink-0 mt-0.5" />
                  <span><strong>Instant payout on approval:</strong> The moment content is approved, money moves to your bank.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#FF5B00] shrink-0 mt-0.5" />
                  <span><strong>Polite automated WhatsApp alerts:</strong> Due date reminders sent automatically without awkwardness.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SMOOTH TAB SWITCHER: CREATORS VS BRANDS */}
      <section id="solutions" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for both sides of the collaboration
          </h2>
          <p className="text-sm text-ink-secondary">
            Switch between views to see how CreateKar simplifies the process for your specific role.
          </p>

          {/* Interactive Tab Switcher with Smooth Transition */}
          <div className="inline-flex items-center rounded-xl border border-border-strong bg-surface p-1.5 mt-4">
            <button
              onClick={() => setActiveTab("creator")}
              className={`relative rounded-lg px-6 py-2.5 text-xs sm:text-sm font-semibold transition-[color,background-color] duration-200 ${
                activeTab === "creator"
                  ? "bg-[#FF5B00] text-white"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              For Creators &amp; Influencers
            </button>
            <button
              onClick={() => setActiveTab("agency")}
              className={`relative rounded-lg px-6 py-2.5 text-xs sm:text-sm font-semibold transition-[color,background-color] duration-200 ${
                activeTab === "agency"
                  ? "bg-[#1D62EA] text-white"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              For Brands &amp; Agencies
            </button>
          </div>
        </div>

        {/* Tab Content with Fluid Transition Container */}
        <div className="relative min-h-[380px] overflow-hidden">
          {/* Creator View */}
          <div
            className={`transition-[opacity,transform] duration-300 ease-out transform ${
              activeTab === "creator"
                ? "opacity-100 translate-y-0 relative pointer-events-auto"
                : "opacity-0 -translate-y-4 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="rounded-2xl border border-border-strong bg-surface p-8 sm:p-10 space-y-8">
              <div className="max-w-xl">
                <span className="text-xs font-semibold text-[#FF5B00]">
                  Creator Benefits
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Focus on making great content. We handle the business.
                </h3>
                <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                  Never worry about unpaid brand deals again. See real money safely deposited before you touch your camera.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-xl border border-border-subtle bg-surface-elevated p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF5B00]/10 text-[#FF5B00]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Guaranteed Payouts</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Brand deposits your payment safely into bank hold upfront. Once your video is approved, payout is released immediately.
                  </p>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-elevated p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF5B00]/10 text-[#FF5B00]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Capped Revisions</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Contracts explicitly specify revision counts (e.g. 1 or 2 rounds). No more endless script or edit redraws for free.
                  </p>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-elevated p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF5B00]/10 text-[#FF5B00]">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white">WhatsApp Follow-ups</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Automated, polite reminders sent directly to the brand when drafts or payments are awaiting approval.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <Check className="h-4 w-4 text-[#FF5B00]" />
                  <span>Free to join. First 5 contracts are completely free.</span>
                </div>
                <Link
                  href="/signup?role=creator"
                  className="rounded-lg bg-[#FF5B00] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#ff6c1a] transition-colors"
                >
                  Create Creator Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Agency / Brand View */}
          <div
            className={`transition-[opacity,transform] duration-300 ease-out transform ${
              activeTab === "agency"
                ? "opacity-100 translate-y-0 relative pointer-events-auto"
                : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="rounded-2xl border border-border-strong bg-surface p-8 sm:p-10 space-y-8">
              <div className="max-w-xl">
                <span className="text-xs font-semibold text-[#1D62EA]">
                  Brand &amp; Agency Benefits
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Run creator campaigns with complete accountability.
                </h3>
                <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                  Protect your marketing budget. Ensure creators deliver on time and according to brief before any funds are released.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-xl border border-border-subtle bg-surface-elevated p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D62EA]/10 text-[#1D62EA]">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Zero Ghosting Risk</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Protected funds are only released after you review and approve the submitted video drafts and proofs.
                  </p>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-elevated p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D62EA]/10 text-[#1D62EA]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white">100% Tax &amp; GST Ready</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Download compliant B2B tax invoices instantly with your company GSTIN for smooth input credit claims.
                  </p>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-elevated p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D62EA]/10 text-[#1D62EA]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Organized Campaign Hub</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Manage multiple creators, draft links, deadlines, and approvals in a single dashboard instead of messy sheets.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <Check className="h-4 w-4 text-[#1D62EA]" />
                  <span>Supports UPI, NetBanking, and corporate Credit Cards.</span>
                </div>
                <Link
                  href="/signup?role=agency"
                  className="rounded-lg bg-[#1D62EA] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1a55cc] transition-colors"
                >
                  Create Agency Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple 3-step collaboration flow
          </h2>
          <p className="text-sm text-ink-secondary">
            No endless meetings or confusing paperwork. Get from campaign brief to completed video in days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
            <span className="text-xs font-semibold text-[#FF5B00]">1. Agreement</span>
            <h3 className="text-lg font-bold text-white">Agree &amp; Sign</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Brand and creator align on deliverables, deadlines, and pricing. Both parties sign the agreement via a quick phone OTP.
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
            <span className="text-xs font-semibold text-[#FF5B00]">2. Protected Advance</span>
            <h3 className="text-lg font-bold text-white">Deposit Advance Safely</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              The brand deposits the agreed advance into safe bank protection. Creator gets notified immediately and begins production.
            </p>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-3 hover:-translate-y-1 hover:border-border-strong transition-[transform,border-color] duration-200">
            <span className="text-xs font-semibold text-[#FF5B00]">3. Instant Payout</span>
            <h3 className="text-lg font-bold text-white">Approve &amp; Release</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Creator uploads the deliverable. Brand reviews, requests minor edits or clicks Approve to instantly release the payout.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section id="safety" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF5B00]">
            <HelpCircle className="h-4 w-4" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border-subtle bg-surface overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-[#FF5B00] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180 text-[#FF5B00]" : "text-ink-muted"
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-ink-secondary leading-relaxed pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border-strong bg-surface-elevated p-8 sm:p-12 text-center space-y-6">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to work with complete peace of mind?
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Join thousands of creators and growth marketing agencies in India who do deals without payment friction.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/signup?role=creator"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FF5B00] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#ff6c1a] active:scale-95 transition-transform"
            >
              <span>Sign Up as Creator</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup?role=agency"
              className="rounded-lg border border-border-subtle bg-surface px-6 py-3.5 text-sm font-semibold text-ink-primary hover:border-border-strong hover:bg-surface-elevated transition-colors"
            >
              Sign Up as Agency
            </Link>
          </div>
          <p className="text-xs text-ink-muted">
            Free to get started • No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
