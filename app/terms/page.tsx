import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Contract Rules • CreateKar",
  description: "Terms of service, escrow protocol regulations, and creator collaboration rules.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to CreateKar</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Scale className="h-6 w-6 text-brand-gold" />
        <span className="text-xs font-semibold text-brand-gold">
          Information Technology Act, 2000
        </span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
        Terms of Service &amp; Escrow Rules
      </h1>
      <p className="mt-2 text-xs text-ink-muted">
        Effective date: October 2026 • CreateKar Technologies Pvt Ltd
      </p>

      <div className="mt-8 space-y-8 text-sm text-ink-secondary leading-relaxed pt-8">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink-primary">1. Agreement Overview</h2>
          <p>
            By registering, drafting contracts, or participating in campaign escrow on CreateKar, both Creators and Agencies agree to be bound by these Terms of Service. Contracts generated on CreateKar with Aadhaar digital signatures are legally binding under Section 10A of the Information Technology Act, 2000.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink-primary">2. Escrow Mechanics &amp; Milestone Settlement</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Funding Requirement:</strong> An agency or brand must fund the agreed contract milestone into the escrow vault before the creator is obligated to start production.</li>
            <li><strong>Deliverable Submission:</strong> Creators must upload deliverables before the contract deadline.</li>
            <li><strong>Review Window:</strong> The agency has 5 business days to either approve the deliverable or request revisions as per agreed terms. If no revision or rejection is filed within 5 days, escrow funds auto-release.</li>
            <li><strong>Automatic Payout:</strong> Upon deliverable approval, the corresponding escrow milestone is instantly released to the creator&apos;s verified bank account.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink-primary">3. Invoicing &amp; GST Compliance</h2>
          <p>
            CreateKar automatically issues GST-compliant tax invoices on behalf of verified parties upon payment release. Invoices carry the CreateKar watermark on Basic tiers, while Influencer and Enterprise tiers generate unwatermarked, white-labeled invoices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink-primary">4. Dispute Arbitration</h2>
          <p>
            If a dispute arises regarding deliverable quality, scope creep, or timeline failure, either party may escalate to CreateKar Dispute Moderation. The escrow funds remain locked in the vault until both parties sign a mutual resolution or the arbitrator issues a binding determination.
          </p>
        </section>
      </div>
    </div>
  );
}
