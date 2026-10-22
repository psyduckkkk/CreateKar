import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, FileCheck, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy • DPDP Act 2023 Compliance",
  description: "CreateKar data privacy, cryptographic document verification, and DPDP compliance framework.",
};

export default function PrivacyPage() {
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
        <Shield className="h-6 w-6 text-[#FF5B00]" />
        <span className="text-xs font-semibold text-[#FF5B00]">
          Data Protection • DPDP Act 2023 Compliance
        </span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Privacy &amp; Data Protection Policy
      </h1>
      <p className="mt-2 text-xs text-ink-muted">
        Last updated: October 2026 • CreateKar Technologies Pvt Ltd
      </p>

      <div className="mt-8 space-y-8 text-sm text-ink-secondary leading-relaxed pt-8">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white">1. Principles of Data Collection</h2>
          <p>
            CreateKar Technologies Pvt Ltd acts as a Data Fiduciary under the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>. We collect and process personal and commercial data strictly for executing creator campaign agreements, generating GST tax invoices, securing escrow balances, and fulfilling statutory taxation requirements.
          </p>
        </section>

        {/* Section 2: Contract Hashing & Aadhaar Protections */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Lock className="h-5 w-5 text-[#FF5B00]" />
            <h2 className="text-base">2. SHA-256 Cryptographic Records &amp; Aadhaar Privacy</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>SHA-256 Document Hashes:</strong> By default, all contracts are cryptographically summarized using non-reversible SHA-256 hashing. The resulting cryptographic digest acts as an immutable tamper-evident receipt without exposing private negotiations in public logs.
            </li>
            <li>
              <strong>Zero Storage of Raw Aadhaar Numbers:</strong> Where parties mutually opt for Aadhaar OTP e-signatures, the verification is routed entirely through a Controller of Certifying Authorities (CCA) licensed partner. CreateKar strictly complies with the <strong>Aadhaar Act, 2016</strong> and <strong>NEVER stores raw 12-digit Aadhaar numbers or biometrics</strong>. Only masked references (last 4 digits) and licensed transaction tokens are retained.
            </li>
          </ul>
        </section>

        {/* Section 3: Payment Data Security */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CreditCard className="h-5 w-5 text-[#FF5B00]" />
            <h2 className="text-base">3. Domestic &amp; International Payment Data Security</h2>
          </div>
          <p>
            All domestic (UPI, NetBanking, RuPay) and international card payments are processed via our PCI-DSS Level 1 certified partner, <strong>Razorpay</strong>. CreateKar does not view, collect, or store full credit card numbers, CVV codes, or net banking credentials on its servers.
          </p>
        </section>

        {/* Section 4: Rights and Grievance Officer */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white">4. User Rights &amp; Grievance Officer</h2>
          <p>
            Under the DPDP Act, 2023, you hold the right to review, update, or request the deletion of your personal account data, subject to mandatory 7-year GST invoice and financial audit retention laws under the Companies Act, 2013 and CGST Act, 2017.
          </p>
          <div className="rounded-lg border border-border-subtle bg-surface p-4 text-xs space-y-1 mt-3">
            <p className="font-semibold text-white">Trust, Safety &amp; Grievance Desk</p>
            <p>Designation: Grievance Officer, CreateKar Technologies Pvt Ltd</p>
            <p>Email: <a href="mailto:grievance@createkar.com" className="text-[#FF5B00] underline">grievance@createkar.com</a></p>
            <p>Address: Indiranagar 100ft Road, Bangalore, Karnataka 560038, India</p>
          </div>
        </section>
      </div>
    </div>
  );
}
