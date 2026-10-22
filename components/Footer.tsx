import Link from "next/link";
import { ShieldCheck, Mail, MapPin, FileText } from "lucide-react";
import { CreateKarLogo } from "./CreateKarLogo";

export function Footer() {
  return (
    <footer data-ui="footer" className="border-t border-border-subtle bg-surface text-ink-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-4">
            <CreateKarLogo size="md" showTagline={false} />
            <p className="text-xs text-ink-muted leading-relaxed">
              Safe advance payments, digital contracts, and automated GST invoices for Indian creators and marketing brands.
            </p>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-[#FF5B00]" />
              <span>100% Escrow Protection • RBI Compliant Banking</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold text-ink-primary">
              Product
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="#how-it-works" className="hover:text-ink-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-ink-primary transition-colors">
                  For Creators
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-ink-primary transition-colors">
                  For Agencies &amp; Brands
                </Link>
              </li>
              <li>
                <Link href="#safety" className="hover:text-ink-primary transition-colors">
                  Escrow Payment Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links (Checklist 15 & 16) */}
          <div>
            <h3 className="text-xs font-semibold text-ink-primary">
              Compliance &amp; Trust
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-ink-primary transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Terms &amp; Dispute Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ink-primary transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Privacy Policy (DPDP 2023)</span>
                </Link>
              </li>
              <li>
                <span className="text-ink-muted">GST Registered: B2B Compliant Invoices</span>
              </li>
              <li>
                <span className="text-ink-muted">GSTIN: 29AABCC1234F1Z8</span>
              </li>
            </ul>
          </div>

          {/* Real Contact Address & Details (Checklist 19) */}
          <div>
            <h3 className="text-xs font-semibold text-ink-primary">
              Office &amp; Help
            </h3>
            <div className="mt-4 space-y-2 text-xs text-ink-muted">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#FF5B00] shrink-0 mt-0.5" />
                <span>
                  Indiranagar 100ft Road, Stage 2, Bangalore, Karnataka 560038, India
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#FF5B00] shrink-0" />
                <a href="mailto:support@createkar.com" className="hover:text-ink-primary transition-colors">
                  support@createkar.com
                </a>
              </div>
              <p className="pt-2 text-[11px] text-ink-muted">
                Support Hours: Mon – Sat (9:30 AM – 6:30 PM IST)
              </p>
            </div>
          </div>
        </div>

        <div data-ui="footer-copyright" className="mt-8 border-t border-border-subtle pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <p>© {new Date().getFullYear()} CreateKar Technologies Pvt Ltd. All rights reserved.</p>
          <p className="text-[11px] text-ink-muted">
            Collab fearlessly. Get paid safely.
          </p>
        </div>
      </div>
    </footer>
  );
}
