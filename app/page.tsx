import Link from 'next/link';
import { 
  ArrowRight, 
  FileText, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  Layers 
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-sky-500">Create</span>Kar
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link href="/creators" className="text-slate-300 hover:text-white transition">
              Find Creators
            </Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
              Creator Deals
            </Link>
            <Link href="/agency/dashboard" className="text-slate-300 hover:text-white transition">
              Agency Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/creators"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-sky-950/40"
            >
              <span>Explore Creators</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 border border-sky-800/70 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-6 mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          The Direct Commercial Infrastructure for Creators
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Direct creator contracts.{' '}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Zero platform commission.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Automated GST invoices, ironclad deliverables, and direct payouts for Indian brands and creators.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/creators"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-base font-semibold shadow-xl shadow-sky-950/50 transition active:scale-[0.98]"
          >
            <span>Find Creators</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-base font-semibold transition"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Creator Dashboard</span>
          </Link>

          <Link
            href="/agency/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-base font-semibold transition"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Agency Dashboard</span>
          </Link>
        </div>

        {/* Metrics Row */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-3xl font-extrabold text-white">0%</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">
              Platform Commission
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Creators keep 100% of agreed budget</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-3xl font-extrabold text-sky-400">₹499</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">
              Flat Agency Processing
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Zero percentage deductions on settlement</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-3xl font-extrabold text-emerald-400">100%</div>
            <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">
              Deliverable Protection
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Structured review prior to payout authorization</p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Built for Transparent Indian Brand Collaborations
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              Eliminate agency opacity, manual invoicing friction, and deliverable misunderstandings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-800/70 text-sky-400 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                0% Platform Commission
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Creators keep 100% of deal value. We charge no commission cuts or hidden agency percentages on creator earnings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/70 text-emerald-400 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Automated GST Invoicing
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                SAC 9983 tax breakdowns and instant ITC claims. Clean, printable commercial tax invoices generated automatically upon approval.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/70 text-purple-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Deliverable Protection
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Assets reviewed before payout authorization. Structured review, feedback cycles, and clear deliverable status tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Ready to contract top creators with zero commission loss?
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Explore our directory of verified Indian talent and dispatch your first campaign proposal in minutes.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-sky-950/40 transition active:scale-[0.98]"
          >
            <span>Explore Creator Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CreateKar</span>
            <span>•</span>
            <span>Direct Commercial Contracts & Deliverable Settlements</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/creators" className="hover:text-slate-300 transition">
              Creators
            </Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition">
              Creator Inbox
            </Link>
            <Link href="/agency/dashboard" className="hover:text-slate-300 transition">
              Agency Dashboard
            </Link>
          </div>

          <div>
            © 2026 CreateKar. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
