import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You • CreateKar",
  description: "Confirmation of your inquiry or transaction on CreateKar.",
};

export default function ThankYouPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-gold/30 bg-surface-elevated text-brand-gold mb-6">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <span className="text-xs font-semibold text-brand-gold">
        Inquiry Recorded On Sovereign Ledger
      </span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
        Thank you for choosing CreateKar.
      </h1>
      <p className="mt-4 text-sm text-ink-secondary leading-relaxed">
        Your request has been securely dispatched. Our compliance and escrow team will verify the details within 2 business hours. If you started an account registration, please check your inbox for verification.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-md border border-border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-ink-primary hover:border-border-strong transition-colors"
        >
          Return to Home
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-md bg-brand-gold px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-gold-light transition-transform active:scale-95"
        >
          <span>Go to Workspace</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
