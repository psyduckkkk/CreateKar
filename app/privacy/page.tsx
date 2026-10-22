import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy • DPDP Act 2023 Compliance",
  description: "CreateKar data privacy, consent management, and DPDP compliance framework.",
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
        <Shield className="h-6 w-6 text-brand-gold" />
        <span className="text-xs font-semibold text-brand-gold">
          Legal Framework • Version 2.0
        </span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
        Privacy &amp; Data Protection Policy
      </h1>
      <p className="mt-2 text-xs text-ink-muted">
        Last updated: October 2026 • Compliant with Digital Personal Data Protection (DPDP) Act, 2023
      </p>

      <div className="mt-8 space-y-8 text-sm text-ink-secondary leading-relaxed pt-8">
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink-primary">1. Principles of Data Fiduciary</h2>
          <p>
            CreateKar Technologies Pvt Ltd acts as a Data Fiduciary under the Digital Personal Data Protection Act, 2023. We collect and process personal data exclusively for verified purposes: executing creator contracts, facilitating milestone escrow transactions, verifying Aadhaar e-signatures, and issuing GST-compliant tax invoices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink-primary">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li><strong>Identity &amp; Profile Data:</strong> Full legal name, PAN, verified Aadhaar hash for digital signatures, GSTIN, and business addresses.</li>
            <li><strong>Financial &amp; Escrow Records:</strong> Bank account numbers, IFSC codes, UPI handles, and payment gateway references (processed via PCI-DSS Level 1 certified partners).</li>
            <li><strong>Campaign &amp; Deliverable Content:</strong> Contracts, video submission URLs, review audit logs, and communication timestamps.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink-primary">3. Escrow &amp; Transaction Security</h2>
          <p>
            All contract escrow funds are held in secure nodal/escrow banking partner accounts governed by Reserve Bank of India (RBI) guidelines. No funds can be released without deliverable approval or formal arbitration resolution.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-ink-primary">4. Data Principal Rights &amp; Grievance Officer</h2>
          <p>
            Under the DPDP Act, you possess the right to access, correct, or request deletion of your personal data, subject to statutory GST and tax invoice retention requirements (7 years).
          </p>
          <div className="rounded-lg border border-border-subtle bg-surface p-4 text-xs space-y-1">
            <p className="font-semibold text-ink-primary">Grievance Officer: Ananya Sharma</p>
            <p>Designation: Head of Trust, Safety &amp; Legal Compliance</p>
            <p>Email: <a href="mailto:grievance@createkar.com" className="text-brand-gold underline">grievance@createkar.com</a></p>
            <p>Address: Indiranagar 100ft Road, Bangalore, Karnataka 560038, India</p>
          </div>
        </section>
      </div>
    </div>
  );
}
