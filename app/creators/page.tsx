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
  RefreshCw,
  Sparkles
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
    <main className="min-h-screen bg-dark text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between pb-6 mb-8 border-b border-dark-border">
        <div className="flex items-center gap-6">
          <CreateKarLogo size="md" href="/" />
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link 
              href="/creators" 
              className="text-white font-semibold border-b-2 border-indigo-500 pb-1"
            >
              Creators
            </Link>
            <Link 
              href="/dashboard" 
              className="hover:text-white transition"
            >
              Creator Desk
            </Link>
            <Link 
              href="/agency/dashboard" 
              className="hover:text-white transition"
            >
              Agency Desk
            </Link>
            <Link 
              href="/settings" 
              className="hover:text-white transition"
            >
              Settings
            </Link>
          </div>
        </div>

        <HeaderUserNav />
      </nav>

      {/* Header section */}
      <header className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Verified Creator Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          Discover & Contract Top Creators
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl font-sans">
          Browse verified Indian independent creators across top performing commercial niches, inspect baseline rates, and propose bilateral campaign briefs directly.
        </p>
      </header>

      {/* Controls & Filter Pills */}
      <section className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Niche filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0" role="tablist">
            {FILTER_NICHES.map((niche) => {
              const isActive = activeFilter === niche;
              return (
                <button
                  key={niche}
                  onClick={() => setActiveFilter(niche)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                      : 'bg-dark-surface text-slate-400 border border-dark-border hover:text-white hover:border-slate-700'
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
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle, or bio..."
              className="w-full pl-10 pr-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
            />
          </div>
        </div>
      </section>

      {/* Directory Grid or Loading/Error State */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading verified creators...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-red-950/30 border border-red-900/50 rounded-2xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold font-display text-white">Error Loading Creators</h3>
          <p className="text-sm text-slate-400 mt-1 mb-5">{errorMessage}</p>
          <button
            onClick={fetchCreators}
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-elevated hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="py-20 text-center bg-dark-surface border border-dark-border rounded-2xl p-8">
          <p className="text-slate-400 text-sm">No creators found matching your criteria.</p>
          <button
            onClick={() => {
              setActiveFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 text-indigo-400 hover:underline text-xs font-semibold"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => {
            const formattedRate = Number(creator.starting_rate || 0).toLocaleString('en-IN');

            return (
              <article
                key={creator.id}
                className="bg-dark-surface border border-dark-border rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition duration-200 shadow-xl group"
              >
                <div>
                  {/* Top: Avatar & Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-dark-elevated flex-shrink-0 border border-dark-border">
                      {creator.avatar_url ? (
                        <Image
                          src={creator.avatar_url}
                          alt={creator.display_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-lg font-display">
                          {creator.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-base font-bold font-display text-white truncate">
                          {creator.display_name}
                        </h2>
                        {creator.is_verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex-shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">@{creator.handle.replace(/^@/, '')}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {creator.niche && (
                          <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-dark-elevated text-slate-300 border border-dark-border">
                            {creator.niche}
                          </span>
                        )}
                        {creator.city && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {creator.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 leading-relaxed font-sans">
                    {creator.bio || 'Independent creator open for verified brand partnerships and commercial campaigns.'}
                  </p>
                </div>

                {/* Bottom: Rate and Invite CTA */}
                <div className="pt-4 border-t border-dark-border flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                      Starting Rate
                    </span>
                    <span className="text-lg font-bold font-mono text-white tracking-tight">
                      ₹{formattedRate}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenProposal(creator)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-950/50 transition active:scale-[0.98]"
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
