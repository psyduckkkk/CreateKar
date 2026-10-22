"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export function StickyMobileCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-surface/95 backdrop-blur-md border-t border-border-strong md:hidden transition-transform animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-ink-primary flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#FF5B00]" />
            <span>Guaranteed Payments</span>
          </span>
          <span className="text-[10px] text-ink-muted">No more chasing invoices</span>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF5B00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#ff6c1a] active:scale-95 transition-colors"
        >
          <span>Get Started</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
