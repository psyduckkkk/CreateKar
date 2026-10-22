"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateKarLogo } from "./CreateKarLogo";
import { Award, LogOut } from "lucide-react";
import { toast } from "sonner";

interface CreatorNavProps {
  activeTab: "overview" | "contracts" | "deliveries" | "invoices" | "payments" | "plan";
  setActiveTab: (tab: "overview" | "contracts" | "deliveries" | "invoices" | "payments" | "plan") => void;
  creatorName: string;
  badgeType: "none" | "verified" | "famous";
  planTier: "basic" | "pro" | "influencer";
}

export function CreatorNav({
  activeTab,
  setActiveTab,
  creatorName,
  badgeType,
  planTier,
}: CreatorNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <CreateKarLogo size="md" />

          {/* Navigation Tabs - Strict Rule: NO Explore Creators tab for Creator! */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab("overview")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === "overview"
                  ? "bg-surface-elevated text-white font-semibold"
                  : "text-ink-secondary hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("contracts")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === "contracts"
                  ? "bg-surface-elevated text-white font-semibold"
                  : "text-ink-secondary hover:text-white"
              }`}
            >
              Contracts
            </button>
            <button
              onClick={() => setActiveTab("deliveries")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === "deliveries"
                  ? "bg-surface-elevated text-white font-semibold"
                  : "text-ink-secondary hover:text-white"
              }`}
            >
              Deliverables
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === "invoices"
                  ? "bg-surface-elevated text-white font-semibold"
                  : "text-ink-secondary hover:text-white"
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === "payments"
                  ? "bg-surface-elevated text-white font-semibold"
                  : "text-ink-secondary hover:text-white"
              }`}
            >
              Payments &amp; Escrow
            </button>
            <button
              onClick={() => setActiveTab("plan")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === "plan"
                  ? "bg-surface-elevated text-white font-semibold"
                  : "text-ink-secondary hover:text-white"
              }`}
            >
              Plan &amp; Boost
            </button>
          </nav>
        </div>

        {/* User Profile & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-xs font-bold text-[#FF5B00] border border-border-strong">
              {creatorName ? creatorName.charAt(0) : "C"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-none">
                {creatorName}
              </span>
              <div className="flex items-center gap-1 mt-1">
                {badgeType === "famous" ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-300">
                    <Award className="h-3 w-3" />
                    <span>Famous Creator</span>
                  </span>
                ) : badgeType === "verified" ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-400">
                    <Award className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-ink-muted capitalize">
                    {planTier} Plan
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-ink-muted hover:text-white hover:border-border-strong transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
