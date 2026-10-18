import Link from 'next/link';
import { 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Check, 
  Lock, 
  CreditCard 
} from 'lucide-react';
import CreateKarLogo from '@/components/Logo';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-ledger bg-paper sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <CreateKarLogo size="md" />

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider font-mono font-medium text-ink-muted">
            <Link href="/creators" className="hover:text-ink transition-colors">
              Creators
            </Link>
            <Link href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </Link>
            <Link href="#protocol" className="hover:text-ink transition-colors">
              Legal Protocol
            </Link>
            <Link href="/dashboard" className="hover:text-ink transition-colors">
              Creator Desk
            </Link>
            <Link href="/agency/dashboard" className="hover:text-ink transition-colors">
              Agency Desk
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-medium text-ink border border-ink rounded-md hover:bg-ink hover:text-paper transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 text-xs font-medium text-paper bg-ink rounded-md hover:bg-black transition-colors"
            >
              Open Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center">
        {/* Category Kicker */}
        <div className="mb-6 inline-block mx-auto">
          <span className="font-mono text-xs text-ink-muted tracking-widest uppercase border border-ledger bg-white px-3 py-1 rounded-sm">
            [ SAC CODE 9983 • INDIAN JURISDICTION ]
          </span>
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-6xl text-ink tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Sovereign Commercial Infrastructure for Creators & Agencies.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          Direct bilateral contracts, zero percent platform commission, automated GST compliance, and court-admissible SHA-256 digital execution seals.
        </p>

        {/* Primary CTA Row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/creators"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-paper text-sm font-medium rounded-md hover:bg-black transition-colors"
          >
            <span>Explore Verified Creators</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ink border border-ledger hover:border-ink text-sm font-medium rounded-md transition-colors"
          >
            <span>Contract as Agency</span>
          </Link>
        </div>

        {/* Notarial Ledger Metric Strip */}
        <div className="mt-16 pt-10 border-t border-ledger grid grid-cols-1 sm:grid-cols-3 gap-0 max-w-3xl mx-auto divide-y sm:divide-y-0 sm:divide-x divide-ledger bg-white border border-ledger rounded-md">
          <div className="p-5 text-center">
            <div className="font-mono text-3xl font-bold text-ink">0.00%</div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-muted mt-1">
              Platform Take Rate
            </div>
            <p className="text-xs text-ink-muted mt-1">Creators retain 100% of gross invoice amount</p>
          </div>

          <div className="p-5 text-center">
            <div className="font-mono text-3xl font-bold text-ink">₹499</div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-muted mt-1">
              Flat Agency Settlement
            </div>
            <p className="text-xs text-ink-muted mt-1">Single convenience fee per executed contract</p>
          </div>

          <div className="p-5 text-center">
            <div className="font-mono text-3xl font-bold text-seal">SHA-256</div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-muted mt-1">
              Judicial Hash Seal
            </div>
            <p className="text-xs text-ink-muted mt-1">Evidentiary audit trail on every deliverable</p>
          </div>
        </div>
      </section>

      {/* Feature Matrix: The Notarial Grid */}
      <section id="protocol" className="py-20 bg-paper border-t border-ledger px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              ARCHIVAL STANDARDS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
              Commercial Governance Built for Legal Certainty
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              Replacing informal WhatsApp agreements and PDF invoices with signed digital contracts enforceable under Section 65B of the Indian Evidence Act.
            </p>
          </div>

          {/* 3-Column Notarial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-ledger divide-y md:divide-y-0 md:divide-x divide-ledger bg-white rounded-md">
            {/* Col 1 */}
            <div className="p-8 space-y-4">
              <div className="font-mono text-xs text-ink-muted uppercase tracking-widest flex items-center justify-between pb-3 border-b border-ledger">
                <span>SECTION 01</span>
                <CreditCard className="w-4 h-4 text-ink" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                0% Commission, Flat ₹499 Fee
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Traditional talent agencies extract 15% to 30% from creative remuneration. CreateKar operates as neutral software infrastructure: brand agencies pay a nominal flat ₹499 fee per contract, while contractors retain 100% of agreed budget.
              </p>
              <div className="pt-4 border-t border-ledger font-mono text-xs text-ink">
                Direct UPI & RTGS settlement routes
              </div>
            </div>

            {/* Col 2 */}
            <div className="p-8 space-y-4">
              <div className="font-mono text-xs text-ink-muted uppercase tracking-widest flex items-center justify-between pb-3 border-b border-ledger">
                <span>SECTION 02</span>
                <Lock className="w-4 h-4 text-seal" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                Court-Admissible Execution
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Every deal acceptance captures an immutable terms snapshot, signatory IP address, and UTC timestamp, cryptographically sealed with a SHA-256 evidentiary hash that mathematically proves terms have remained unmodified.
              </p>
              <div className="pt-4 border-t border-ledger font-mono text-xs text-ink">
                Compliant with Information Technology Act, 2000
              </div>
            </div>

            {/* Col 3 */}
            <div className="p-8 space-y-4">
              <div className="font-mono text-xs text-ink-muted uppercase tracking-widest flex items-center justify-between pb-3 border-b border-ledger">
                <span>SECTION 03</span>
                <FileText className="w-4 h-4 text-pine" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                Automated SAC 9983 Invoices
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Eliminate bookkeeping disputes. On deliverable approval, the engine generates an itemized B2B tax invoice with sequential numbering, PAN validation, and CGST/SGST/IGST breakdowns ready for statutory Input Tax Credit (ITC).
              </p>
              <div className="pt-4 border-t border-ledger font-mono text-xs text-ink">
                Service Accounting Code 9983 itemized
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-paper border-t border-ledger px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">
            TARIFF SCHEDULE
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink mt-1">
            Zero Take Rate. Flat Processing.
          </h2>
          <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
            Transparent pricing for Indian creative studios and international brands.
          </p>

          <div className="mt-10 bg-white border border-ledger rounded-md p-8 sm:p-10 text-left max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-ledger gap-2">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Agency Contract License</h3>
                <p className="text-xs text-ink-muted mt-0.5">Per-deal execution & statutory tax generation</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-mono text-3xl font-bold text-ink">₹499</span>
                <span className="text-xs text-ink-muted block">one-time / contract</span>
              </div>
            </div>

            <ul className="py-6 space-y-3 text-sm text-ink-muted">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-pine flex-shrink-0" />
                <span><strong className="text-ink">0% Creator Commission:</strong> 100% of deal budget routed to contractor</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-pine flex-shrink-0" />
                <span><strong className="text-ink">Multi-Currency Checkout:</strong> Domestic UPI, Netbanking, & International Cards</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-pine flex-shrink-0" />
                <span><strong className="text-ink">Cryptographic Seal:</strong> Evidentiary SHA-256 signature hash</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-pine flex-shrink-0" />
                <span><strong className="text-ink">Automated GST Invoices:</strong> Downloadable, audit-ready PDF records</span>
              </li>
            </ul>

            <div className="pt-6 border-t border-ledger flex items-center justify-between">
              <span className="text-xs font-mono text-ink-muted">NO SUBSCRIPTION REQUIRED</span>
              <Link
                href="/creators"
                className="px-5 py-2.5 bg-ink text-paper text-xs font-semibold rounded-md hover:bg-black transition-colors"
              >
                Contract a Creator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brutalist Archival Footer */}
      <footer className="border-t border-ledger py-12 px-4 sm:px-6 lg:px-8 bg-paper text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-ledger">
            <CreateKarLogo size="md" />

            <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
              <Link href="/creators" className="hover:text-ink transition-colors">
                Directory
              </Link>
              <Link href="/dashboard" className="hover:text-ink transition-colors">
                Creator Desk
              </Link>
              <Link href="/agency/dashboard" className="hover:text-ink transition-colors">
                Agency Desk
              </Link>
              <Link href="/settings" className="hover:text-ink transition-colors">
                Settings
              </Link>
              <Link href="/admin/login" className="hover:text-ink transition-colors">
                Operations
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[11px]">
            <div>
              © 2026 CreateKar Infrastructure. Regulated under Information Technology Act, 2000.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-seal inline-block" />
              <span>JURISDICTION: NEW DELHI / PUNE, REPUBLIC OF INDIA</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
