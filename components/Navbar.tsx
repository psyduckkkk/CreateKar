"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong bg-surface-elevated text-brand-gold transition-colors group-hover:border-brand-gold">
            <span className="font-mono text-sm font-bold tracking-tighter">CK</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-ink-primary">
              CreateKar
            </span>
            <span className="text-[10px] tracking-wider uppercase text-ink-muted -mt-1 font-mono">
              Escrow & Ledger
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-secondary">
          <Link href="#protocol" className="transition-colors hover:text-ink-primary">
            Escrow Protocol
          </Link>
          <Link href="#simulator" className="transition-colors hover:text-ink-primary">
            Deal Simulator
          </Link>
          <Link href="#roster" className="transition-colors hover:text-ink-primary">
            Creators
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-ink-primary">
            Pricing & Plans
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-brand-gold px-4 py-2 text-sm font-semibold text-black transition-transform hover:bg-brand-gold-light active:scale-[0.98]"
          >
            <span>Launch App</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle text-ink-secondary md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border-subtle bg-surface px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-4 text-base font-medium text-ink-secondary">
            <Link
              href="#protocol"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary"
            >
              Escrow Protocol
            </Link>
            <Link
              href="#simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary"
            >
              Deal Simulator
            </Link>
            <Link
              href="#roster"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary"
            >
              Creators
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary"
            >
              Pricing & Plans
            </Link>
            <hr className="border-border-subtle my-2" />
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-ink-primary border border-border-subtle rounded-md"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 bg-brand-gold font-semibold text-black rounded-md"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
