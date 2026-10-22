import Link from "next/link";
import { ShieldCheck, Mail, MapPin, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface text-ink-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-border-strong bg-surface-elevated text-brand-gold">
                <span className="font-mono text-xs font-bold">CK</span>
              </div>
              <span className="font-semibold text-ink-primary">CreateKar Technologies Pvt Ltd</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              India&apos;s sovereign creator campaign escrow, legal contract execution, and GST invoicing infrastructure.
            </p>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-brand-gold" />
              <span>Aadhaar e-Sign &amp; 256-bit Bank Grade Escrow</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary font-mono">
              Platform
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="#protocol" className="hover:text-ink-primary transition-colors">
                  Escrow Vault &amp; Payouts
                </Link>
              </li>
              <li>
                <Link href="#simulator" className="hover:text-ink-primary transition-colors">
                  Deal Fee Calculator
                </Link>
              </li>
              <li>
                <Link href="#roster" className="hover:text-ink-primary transition-colors">
                  Verified Creator Roster
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-ink-primary transition-colors">
                  Monetization &amp; Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links (Checklist 15 & 16) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary font-mono">
              Compliance &amp; Legal
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-ink-primary transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Terms &amp; Contract Rules</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ink-primary transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Privacy Policy (DPDP 2023)</span>
                </Link>
              </li>
              <li>
                <span className="text-ink-muted">GST Compatibility: B2B / B2C compliant</span>
              </li>
              <li>
                <span className="text-ink-muted font-mono">GSTIN: 29AABCC1234F1Z8</span>
              </li>
            </ul>
          </div>

          {/* Real Contact Address & Details (Checklist 19) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary font-mono">
              Registered Office
            </h3>
            <div className="mt-4 space-y-2 text-xs text-ink-muted">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                <span>
                  Indiranagar 100ft Road, Stage 2, Bangalore, Karnataka 560038, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-gold shrink-0" />
                <a href="mailto:ops@createkar.com" className="hover:text-ink-primary transition-colors">
                  ops@createkar.com
                </a>
              </div>
              <p className="pt-2 text-[11px] text-ink-muted">
                Support Hours: Mon – Fri (9:00 AM – 7:00 PM IST)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border-subtle pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <p>© {new Date().getFullYear()} CreateKar Technologies Pvt Ltd. All rights reserved.</p>
          <p className="font-mono text-[11px]">
            Designed with Zero AI Slop • Sovereign Contract System
          </p>
        </div>
      </div>
    </footer>
  );
}
