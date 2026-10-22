"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { CreateKarLogo } from "./CreateKarLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/90" data-ui="main-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Official CreateKar Identity */}
        <CreateKarLogo size="md" showTagline={false} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-secondary">
          <Link href="#how-it-works" className="transition-colors hover:text-ink-primary">
            How It Works
          </Link>
          <Link href="#solutions" className="transition-colors hover:text-ink-primary">
            Creators &amp; Brands
          </Link>
          <Link href="#features" className="transition-colors hover:text-ink-primary">
            Features
          </Link>
          <Link href="#safety" className="transition-colors hover:text-ink-primary">
            Payment Safety
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF5B00] px-4 py-2 text-sm font-semibold text-white transition-transform hover:bg-[#ff6c1a] active:scale-[0.98]"
          >
            <span>Start Collaborating</span>
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
        <div data-ui="mobile-drawer" className="border-b border-border-subtle bg-surface px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-4 text-base font-medium text-ink-secondary">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary"
            >
              How It Works
            </Link>
            <Link
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary"
            >
              Creators &amp; Brands
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary"
            >
              Features
            </Link>
            <Link
              href="#safety"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-ink-primary"
            >
              Payment Safety
            </Link>
            <div className="flex flex-col gap-3 pt-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-ink-primary bg-surface-elevated rounded-md hover:bg-surface-elevated/80"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 bg-[#FF5B00] font-semibold text-white rounded-md"
              >
                Get Started Free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
