"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ck_cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("ck_cookie_consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("ck_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-border-strong bg-surface-elevated p-4 shadow-2xl text-xs text-ink-secondary">
      <div className="flex items-start gap-3">
        <Shield className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="leading-relaxed">
            CreateKar uses essential cookies for secure session authentication and DPDP (2023) compliant fraud prevention.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={accept}
              className="rounded bg-brand-gold px-3 py-1 font-semibold text-black hover:bg-brand-gold-light"
            >
              Accept All
            </button>
            <button
              onClick={decline}
              className="rounded border border-border-subtle px-3 py-1 text-ink-muted hover:text-ink-primary"
            >
              Essential Only
            </button>
            <Link href="/privacy" className="underline ml-auto text-[11px] text-ink-muted hover:text-ink-primary">
              Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
