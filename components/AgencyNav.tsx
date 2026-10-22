"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  FileCheck2,
  Video,
  Receipt,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { CreateKarLogo } from "./CreateKarLogo";

interface AgencyNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName: string;
  planTier: string;
}

export function AgencyNav({
  activeTab,
  setActiveTab,
  companyName,
  planTier
}: AgencyNavProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "explore", label: "Explore Creators", icon: Search },
    { id: "deals", label: "Deals & Contracts", icon: FileCheck2 },
    { id: "reviews", label: "Deliverable Reviews", icon: Video },
    { id: "invoices", label: "GST Invoices", icon: Receipt },
    { id: "settings", label: "Agency Settings", icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface/95" data-ui="header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Agency Identifier */}
        <div className="flex items-center gap-6">
          <Link href="/agency/dashboard" className="flex items-center gap-2">
            <CreateKarLogo size="md" />
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-none">
                CreateKar
              </span>
              <span className="text-[10px] text-ink-muted leading-tight mt-0.5">
                Agency Escrow Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-surface-elevated text-white font-semibold"
                      : "text-ink-secondary hover:text-white hover:bg-surface-elevated/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Agency Identity & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-surface-elevated px-3 py-1.5 border border-border-subtle text-xs">
            <Building2 className="h-3.5 w-3.5 text-[#1D62EA]" />
            <span className="font-semibold text-white max-w-[140px] truncate">{companyName}</span>
            <span className="rounded bg-[#1D62EA]/15 text-[#1D62EA] px-1.5 py-0.5 text-[10px] font-bold uppercase">
              {planTier}
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-white hover:border-border-strong transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{loggingOut ? "Exiting..." : "Log out"}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden p-2 text-ink-secondary hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-subtle bg-surface px-4 py-4 space-y-2" data-ui="mobile-menu">
          <div className="pb-2 border-b border-border-subtle flex items-center justify-between text-xs" data-ui="mobile-user">
            <span className="font-bold text-white">{companyName}</span>
            <span className="rounded bg-[#1D62EA]/15 text-[#1D62EA] px-2 py-0.5 text-[10px] font-bold uppercase">
              {planTier} Plan
            </span>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg ${
                    isActive
                      ? "bg-surface-elevated text-white font-semibold"
                      : "text-ink-secondary hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-surface-elevated rounded-lg pt-3"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out of Agency Hub</span>
          </button>
        </div>
      )}
    </header>
  );
}
