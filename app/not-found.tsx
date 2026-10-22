import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated text-brand-gold mb-6">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <span className="text-sm font-semibold text-brand-gold">
        Ledger Record Missing • Error 404
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
        This contract or page does not exist.
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink-secondary">
        The route you requested could not be verified on the ledger. It may have been moved, completed, or restricted by role permissions.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-brand-gold px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-gold-light transition-transform active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Home</span>
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-ink-primary hover:border-border-strong transition-colors"
        >
          Access Workspace
        </Link>
      </div>
    </div>
  );
}
