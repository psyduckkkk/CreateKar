'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  MapPin, 
  Loader2, 
  ArrowRight, 
  Search,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import type { Profile } from '@/types/database';
import ProposalModal from '@/components/ProposalModal';
import HeaderUserNav from '@/components/HeaderUserNav';
import { CreateKarLogo } from '@/components/Logo';

const FILTER_NICHES = ['All', 'Tech', 'Fashion', 'Fitness', 'Lifestyle'] as const;
type FilterNiche = (typeof FILTER_NICHES)[number];

export default function CreatorsDirectoryPage() {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterNiche>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Proposal modal state
  const [selectedCreator, setSelectedCreator] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCreators = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/creators');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to load creators directory.');
      }

      setCreators(data.creators || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while fetching creators.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleOpenProposal = (creator: Profile) => {
    setSelectedCreator(creator);
    setIsModalOpen(true);
  };

  const handleCloseProposal = () => {
    setIsModalOpen(false);
    setSelectedCreator(null);
  };

  // Filtered creators list
  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const matchesNiche =
        activeFilter === 'All' ||
        (creator.niche && creator.niche.toLowerCase() === activeFilter.toLowerCase());

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        creator.display_name.toLowerCase().includes(query) ||
        creator.handle.toLowerCase().includes(query) ||
        (creator.bio && creator.bio.toLowerCase().includes(query));

      return matchesNiche && matchesSearch;
    });
  }, [creators, activeFilter, searchQuery]);

  return (
    <main className="min-h-screen bg-paper text-ink py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between pb-6 mb-8 border-b border-ledger">
        <div className="flex items-center gap-6">
          <CreateKarLogo size="md" href="/" />
          <div className="hidden sm:flex items-center gap-5 text-xs font-mono uppercase tracking-wider">
            <Link 
              href="/creators" 
              className="text-ink font-bold border-b border-ink pb-0.5"
            >
              Registry
            </Link>
            <Link 
              href="/dashboard" 
              className="text-ink-muted hover:text-ink transition"
            >
              Creator Desk
            </Link>
            <Link 
              href="/agency/dashboard" 
              className="text-ink-muted hover:text-ink transition"
            >
              Agency Desk
            </Link>
            <Link 
              href="/settings" 
              className="text-ink-muted hover:text-ink transition"
            >
              Settings
            </Link>
          </div>
        </div>

        <HeaderUserNav />
      </nav>

      {/* Header section */}
      <header className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-seal-light border border-seal/30 text-seal text-[11px] font-mono uppercase tracking-widest font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Official Creator Registry • Notarized Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-ink">
          Commercial Creator Directory
        </h1>
        <p className="mt-2 text-ink-muted text-sm sm:text-base max-w-2xl font-sans">
          Browse verified Indian independent creators across commercial sectors. Review registered tariff baselines and execute legally binding bilateral contracts.
        </p>
      </header>

      {/* Controls & Filter Pills */}
      <section className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Niche filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0" role="tablist">
            {FILTER_NICHES.map((niche) => {
              const isActive = activeFilter === niche;
              return (
                <button
                  key={niche}
                  onClick={() => setActiveFilter(niche)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-ink text-paper border border-ink font-bold shadow-sm'
                      : 'bg-white text-ink-muted border border-ledger hover:text-ink hover:border-ink'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  {niche}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registry by name, handle, or bio..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-ledger rounded-md text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink font-mono transition"
            />
          </div>
        </div>
      </section>

      {/* Directory Grid or Loading/Error State */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-seal animate-spin mb-4" />
          <p className="text-ink-muted text-xs font-mono uppercase tracking-wider">Accessing registry records...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-seal-light border border-seal/30 rounded-md text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-seal mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-ink">Registry Access Error</h3>
          <p className="text-sm text-ink-muted mt-1 mb-5 font-mono">{errorMessage}</p>
          <button
            onClick={fetchCreators}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-black text-paper rounded-md text-xs font-mono uppercase tracking-wider transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Query
          </button>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="py-20 text-center bg-white border border-ledger rounded-md p-8">
          <p className="text-ink-muted text-sm font-mono">No registered creators matching specified parameters.</p>
          <button
            onClick={() => {
              setActiveFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 text-seal hover:underline text-xs font-mono uppercase tracking-wider font-semibold"
          >
            Clear Search Parameters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => {
            const formattedRate = Number(creator.starting_rate || 0).toLocaleString('en-IN');

            return (
              <article
                key={creator.id}
                className="bg-white border border-ledger rounded-md p-6 flex flex-col justify-between hover:border-ink transition-colors duration-150 group shadow-sm"
              >
                <div>
                  {/* Top: Avatar & Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-paper flex-shrink-0 border border-ledger">
                      {creator.avatar_url ? (
                        <Image
                          src={creator.avatar_url}
                          alt={creator.display_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-muted font-mono font-bold text-base">
                          {creator.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-base font-bold font-display text-ink truncate">
                          {creator.display_name}
                        </h2>
                        {creator.is_verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-seal-light border border-seal/30 text-seal font-mono text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-ink-muted truncate">@{creator.handle.replace(/^@/, '')}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {creator.niche && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-sm bg-paper text-ink border border-ledger">
                            {creator.niche}
                          </span>
                        )}
                        {creator.city && (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-ink-muted">
                            <MapPin className="w-3 h-3 text-ink-muted" />
                            {creator.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-ink-muted line-clamp-3 mb-6 leading-relaxed font-sans">
                    {creator.bio || 'Independent creator registered for commercial assignments and verified brand collaborations.'}
                  </p>
                </div>

                {/* Bottom: Rate and Invite CTA */}
                <div className="pt-4 border-t border-ledger flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] uppercase font-mono tracking-wider text-ink-muted">
                      Base Tariff
                    </span>
                    <span className="text-lg font-bold font-mono text-ink tracking-tight">
                      ₹{formattedRate}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenProposal(creator)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-ink hover:bg-black text-paper text-xs font-mono uppercase tracking-wider rounded-md transition active:scale-[0.99]"
                  >
                    <span>Issue Brief</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Proposal Modal */}
      <ProposalModal
        isOpen={isModalOpen}
        onClose={handleCloseProposal}
        creator={selectedCreator}
        onProposalCreated={() => {
          // Can refresh or trigger further UI status
        }}
      />
    </main>
  );
}
