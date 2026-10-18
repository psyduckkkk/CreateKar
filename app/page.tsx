import Link from 'next/link';
import { 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Check, 
  Lock, 
  CreditCard,
  Sparkles,
  Zap
} from 'lucide-react';
import CreateKarLogo from '@/components/Logo';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Top Navbar */}
      <header className="border-b border-dark-border bg-dark/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <CreateKarLogo size="md" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/creators" className="hover:text-white transition-colors">
              Creators
            </Link>
            <Link href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#protocol" className="hover:text-white transition-colors">
              Infrastructure
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Creator Desk
            </Link>
            <Link href="/agency/dashboard" className="hover:text-white transition-colors">
              Agency Desk
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-950/60 transition active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center overflow-hidden">
        {/* Subtle Background Glow (Linear / Stripe style) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Category Pill */}
        <div className="mb-6 inline-block mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-surface/90 border border-dark-border text-xs font-medium text-slate-300 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">SAC Code 9983</span>
            <span className="text-dark-border">•</span>
            <span className="text-indigo-400 font-semibold">Indian Commercial Jurisdiction</span>
          </div>
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight max-w-4xl mx-auto leading-[1.08] relative z-10">
          Direct Commercial Contracts for <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">Creators & Brands.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed relative z-10 font-sans">
          Bilateral dealflow with zero percent creator commission, automated B2B GST compliance, and court-admissible SHA-256 cryptographic execution seals.
        </p>

        {/* Primary CTA Row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
          <Link
            href="/creators"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-xl shadow-indigo-950/60 transition active:scale-[0.98]"
          >
            <span>Explore Creator Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-dark-surface hover:bg-dark-elevated text-slate-200 border border-dark-border hover:border-slate-700 text-sm font-semibold rounded-xl transition"
          >
            <span>Contract as Agency</span>
          </Link>
        </div>

        {/* 3 Metric Cards Strip */}
        <div className="mt-16 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto relative z-10">
          <div className="p-6 text-center rounded-2xl bg-dark-surface/80 border border-dark-border shadow-xl backdrop-blur-sm">
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">0%</div>
            <div className="text-xs uppercase font-semibold tracking-wider text-indigo-400 mt-1">
              Platform Take Rate
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Creators retain 100% of agreed campaign value</p>
          </div>

          <div className="p-6 text-center rounded-2xl bg-dark-surface/80 border border-dark-border shadow-xl backdrop-blur-sm">
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">₹499</div>
            <div className="text-xs uppercase font-semibold tracking-wider text-violet-400 mt-1">
              Flat Agency Settlement
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Single convenience fee per executed contract</p>
          </div>

          <div className="p-6 text-center rounded-2xl bg-dark-surface/80 border border-dark-border shadow-xl backdrop-blur-sm">
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-400">SHA-256</div>
            <div className="text-xs uppercase font-semibold tracking-wider text-emerald-400 mt-1">
              Digital Execution Seal
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Evidentiary audit trail on every deliverable</p>
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section id="protocol" className="py-24 bg-dark-surface/40 border-t border-dark-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14 text-center sm:text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">
              ENGINEERED FOR LEGAL CERTAINTY
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Commercial Dealflow with Zero Friction
            </h2>
            <p className="text-base text-slate-400 mt-2">
              Replacing fragmented WhatsApp agreements with legally binding digital contracts enforceable under Section 65B of the Indian Evidence Act.
            </p>
          </div>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Col 1 */}
            <div className="p-8 rounded-2xl bg-dark-surface border border-dark-border hover:border-indigo-500/40 transition duration-200 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  0% Commission, Flat ₹499
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Traditional talent agencies extract 15% to 30% from creative remuneration. CreateKar operates as neutral software infrastructure: brand agencies pay a nominal flat ₹499 fee per contract, while creators keep 100% of their earnings.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-dark-border text-xs text-indigo-400 font-mono font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct UPI & Netbanking routing</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="p-8 rounded-2xl bg-dark-surface border border-dark-border hover:border-violet-500/40 transition duration-200 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-950/70 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Cryptographic Seal
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Every deal acceptance records an immutable snapshot of terms, signatory IP address, and UTC timestamp, sealed with a SHA-256 evidentiary hash that mathematically proves the agreement has remained unaltered.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-dark-border text-xs text-violet-400 font-mono font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>IT Act 2000 compliant</span>
              </div>
            </div>

            {/* Col 3 */}
            <div className="p-8 rounded-2xl bg-dark-surface border border-dark-border hover:border-emerald-500/40 transition duration-200 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Automated GST Invoices
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Eliminate bookkeeping disputes. On deliverable approval, the engine generates an itemized B2B tax invoice with sequential numbering, PAN validation, and CGST/SGST breakdowns ready for statutory Input Tax Credit (ITC).
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-dark-border text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>SAC 9983 automated breakdown</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">
          TRANSPARENT PRICING
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
          Flat Processing. Zero Take Rate.
        </h2>
        <p className="text-base text-slate-400 mt-2 max-w-md mx-auto">
          Predictable pricing built for modern Indian creative studios and international brands.
        </p>

        <div className="mt-12 bg-gradient-to-b from-dark-surface to-dark-elevated border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-left max-w-2xl mx-auto shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-8 border-b border-dark-border gap-2">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Agency License</h3>
              <p className="text-xs text-slate-400 mt-1">Per-deal contract execution & automated GST invoice</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-mono text-4xl font-extrabold text-white">₹499</span>
              <span className="text-xs text-slate-400 block mt-0.5">one-time / contract</span>
            </div>
          </div>

          <ul className="py-8 space-y-3.5 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong className="text-white">0% Creator Commission:</strong> 100% of deal budget routed to creator</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong className="text-white">Multi-Currency Checkout:</strong> Domestic UPI, Netbanking, & Cards (USD/EUR/INR)</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong className="text-white">Cryptographic Execution:</strong> SHA-256 immutable signature seal</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong className="text-white">Automated GST Invoices:</strong> Downloadable, audit-ready PDF records</span>
            </li>
          </ul>

          <div className="pt-8 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-mono text-slate-400">NO RECURRING SUBSCRIPTIONS</span>
            <Link
              href="/creators"
              className="w-full sm:w-auto text-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 shadow-lg shadow-indigo-950/60"
            >
              Contract a Creator
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Dark Footer */}
      <footer className="border-t border-dark-border py-12 px-4 sm:px-6 lg:px-8 bg-dark text-xs text-slate-400">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-dark-border">
            <CreateKarLogo size="md" />

            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium">
              <Link href="/creators" className="hover:text-white transition">
                Creators Directory
              </Link>
              <Link href="/dashboard" className="hover:text-white transition">
                Creator Desk
              </Link>
              <Link href="/agency/dashboard" className="hover:text-white transition">
                Agency Desk
              </Link>
              <Link href="/admin" className="hover:text-white transition">
                Operations
              </Link>
              <Link href="/settings" className="hover:text-white transition">
                Settings
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>© 2026 CreateKar Technologies. All rights reserved.</p>
            <p className="font-mono text-[11px]">
              Encrypted with SHA-256 • Enforceable under Information Technology Act, 2000
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
