import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck, FileCheck, Globe, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Contract Rules • CreateKar",
  description: "Terms of service, SHA-256 digital contracts, TDS rules, and domestic & international payment terms.",
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
        <Scale className="h-6 w-6 text-[#FF5B00]" />
        <span className="text-xs font-semibold text-[#FF5B00]">
          Legal &amp; Regulatory Framework • IT Act 2000
        </span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Terms of Service &amp; Escrow Rules
      </h1>
      <p className="mt-2 text-xs text-ink-muted">
        Last updated: October 2026 • CreateKar Technologies Pvt Ltd
      </p>

      <div className="mt-8 space-y-8 text-sm text-ink-secondary leading-relaxed pt-8">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white">1. Platform Nature &amp; Intermediary Safe Harbor</h2>
          <p>
            CreateKar operates as a technology intermediary under <strong>Section 79 of the Information Technology Act, 2000</strong>. CreateKar provides the digital venue, contract scaffolding, and milestone payment escrow infrastructure for independent Content Creators and Brands/Agencies. CreateKar is not an employer, advertising agency, or legal party to the individual commercial content agreements executed between users.
          </p>
        </section>

        {/* Section 2: SHA-256 by default & Mutual Aadhaar Opt-in */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <FileCheck className="h-5 w-5 text-[#FF5B00]" />
            <h2 className="text-base">2. Contract Formation &amp; SHA-256 Digital Hashing</h2>
          </div>
          <p>
            Every contract created on CreateKar is governed by <strong>Section 10A of the Information Technology Act, 2000</strong> (validity of electronic contracts).
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>Default Cryptographic Verification (SHA-256):</strong> By default, all contracts are digitally sealed using <strong>SHA-256 cryptographic hashing</strong> combined with device-level authentication, cryptographic timestamps, IP audit logs, and one-time password (OTP) verification. This creates an immutable, tamper-evident legal record admissible in court.
            </li>
            <li>
              <strong>Mutual Aadhaar e-Sign Opt-In:</strong> Both parties (Agency and Creator) may mutually elect to sign via <strong>Aadhaar OTP e-Sign</strong> during deal proposal. When selected, the signing workflow is routed through a licensed Certifying Authority Application Service Provider (ASP) in compliance with the Information Technology (Certifying Authorities) Rules.
            </li>
          </ul>
        </section>

        {/* Section 3: Domestic & International Payments */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CreditCard className="h-5 w-5 text-[#FF5B00]" />
            <h2 className="text-base">3. Domestic &amp; International Payment Processing (Razorpay Escrow)</h2>
          </div>
          <p>
            All payment collections, escrow nodal locks, and creator disbursements are securely processed through our certified payment partner, <strong>Razorpay Software Pvt Ltd</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>Domestic Transactions (India):</strong> Brands may fund contract milestones using Indian UPI, NetBanking, and RuPay/Visa/Mastercard credit and debit cards in Indian Rupees (INR).
            </li>
            <li>
              <strong>International Transactions:</strong> For cross-border campaigns, international brands and agencies can fund milestones in supported major currencies (USD, EUR, GBP, SGD, AED) via international credit/debit cards. Conversions to INR for Indian creators are executed at prevailing RBI reference exchange rates.
            </li>
            <li>
              <strong>Escrow Release Trigger:</strong> The agency must review deliverables within 5 business days of creator submission. Deliverable approval automatically triggers instant transfer of the corresponding escrow balance to the creator&apos;s verified bank account.
            </li>
          </ul>
        </section>

        {/* Section 4: TDS Input & Tax Responsibilities */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Globe className="h-5 w-5 text-[#FF5B00]" />
            <h2 className="text-base">4. TDS (Tax Deducted at Source) &amp; GST Compliance</h2>
          </div>
          <p>
            Under the Indian Income Tax Act, 1961, corporate agencies and brands are required to deduct TDS on payments made to resident creators:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>TDS Prompt for Agencies:</strong> When proposing a contract, agencies are prompted to specify if TDS applies (e.g., <strong>Section 194C</strong> at 1% for individuals / 2% for companies, or <strong>Section 194J</strong> at 2% or 10% for professional fees).
            </li>
            <li>
              <strong>Net Escrow Calculation:</strong> When TDS is selected, CreateKar automatically calculates the Net Payable to Creator, while the agency deposits the net amount into escrow and assumes legal responsibility to remit the deducted TDS to the Income Tax Department and issue <strong>Form 16A</strong> directly to the creator.
            </li>
            <li>
              <strong>GST Tax Invoices:</strong> Upon milestone release, CreateKar automatically generates formal GST tax invoices on behalf of verified creators. Creators with valid GSTIN issue standard tax invoices allowing agencies to claim Input Tax Credit (ITC).
            </li>
          </ul>
        </section>

        {/* Section 5: ASCI Compliance & Content Integrity */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ShieldCheck className="h-5 w-5 text-[#FF5B00]" />
            <h2 className="text-base">5. ASCI Advertising Guidelines &amp; Creator Conduct</h2>
          </div>
          <p>
            Creators warrant that all sponsored deliverables comply with the <strong>Guidelines for Influencer Advertising in Digital Media</strong> issued by the Advertising Standards Council of India (ASCI) and the Central Consumer Protection Authority (CCPA). All commercial posts must carry prominent disclosure labels (such as #Ad, #Sponsored, or #Collab). Content promoting illegal gambling, unauthorized betting apps, or deceptive financial products is strictly prohibited.
          </p>
        </section>

        {/* Section 6: Dispute Arbitration */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white">6. Dispute Mediation &amp; Resolution</h2>
          <p>
            In the event of an irreconcilable dispute regarding deliverable scope or quality, either party may escalate to CreateKar Mediation. Escrow funds remain secured in the nodal pool until a mutual settlement is signed or a final administrative resolution is determined.
          </p>
        </section>
      </div>
    </div>
  );
}
