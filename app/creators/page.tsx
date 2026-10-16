'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BadgeCheck, 
  MapPin, 
  Sparkles, 
  Loader2, 
  Send, 
  Search,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import type { Profile } from '@/types/database';
import ProposalModal from '@/components/ProposalModal';

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
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <Link href="/creators" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-sky-500">Create</span>Kar
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link 
              href="/creators" 
              className="text-sky-400 font-semibold"
            >
              Creator Directory
            </Link>
            <Link 
              href="/dashboard" 
              className="text-slate-400 hover:text-white transition"
            >
              Deals Inbox
            </Link>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition"
        >
          View Deals Inbox
        </Link>
      </nav>

      {/* Header section */}
      <header className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Verified Creator Network
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Discover & Contract Top Creators
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl">
          Browse verified Indian creators across high-performing niches, inspect base commercial rates, and propose custom campaign deliverables directly.
        </p>
      </header>

      {/* Controls & Filter Pills */}
      <section className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Niche filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none" role="tablist">
            {FILTER_NICHES.map((niche) => {
              const isActive = activeFilter === niche;
              return (
                <button
                  key={niche}
                  onClick={() => setActiveFilter(niche)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
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
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle, or bio..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>
      </section>

      {/* Directory Grid or Loading/Error State */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading verified creators...</p>
        </div>
      ) : errorMessage ? (
        <div className="py-16 px-6 bg-red-950/20 border border-red-900/50 rounded-2xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">Error Loading Creators</h3>
          <p className="text-sm text-slate-400 mt-1 mb-5">{errorMessage}</p>
          <button
            onClick={fetchCreators}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8">
          <p className="text-slate-400 text-base">No creators found matching your criteria.</p>
          <button
            onClick={() => {
              setActiveFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 text-sky-400 hover:underline text-sm font-medium"
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
                className="bg-slate-900 border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 transition-shadow duration-200 shadow-lg shadow-black/40 group"
              >
                <div>
                  {/* Top: Avatar & Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                      {creator.avatar_url ? (
                        <Image
                          src={creator.avatar_url}
                          alt={creator.display_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-semibold text-lg">
                          {creator.display_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-base font-semibold text-white truncate">
                          {creator.display_name}
                        </h2>
                        <BadgeCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-slate-400 truncate">{creator.handle}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {creator.niche && (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
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
                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                    {creator.bio || 'Creator specializing in engaging brand integrations and high-quality audience-first content.'}
                  </p>
                </div>

                {/* Bottom: Rate and Invite CTA */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                      Starting Rate
                    </span>
                    <span className="text-lg font-bold text-white tracking-tight">
                      ₹{formattedRate}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenProposal(creator)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-sky-950/40 transition active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Invite to Campaign</span>
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
