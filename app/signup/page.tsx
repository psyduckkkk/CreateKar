"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle, Users, Building2 } from "lucide-react";
import { CreateKarLogo } from "@/components/CreateKarLogo";
import { toast } from "sonner";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<"CREATOR" | "AGENCY">("CREATOR");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "agency") {
      setRole("AGENCY");
    } else if (roleParam === "creator") {
      setRole("CREATOR");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Account created! Redirecting to your workspace...");
      router.push(data.redirectUrl || (role === "CREATOR" ? "/dashboard" : "/agency/dashboard"));
      router.refresh();
    } catch (err: any) {
      setError("Network connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border-strong bg-surface p-7 sm:p-9">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <CreateKarLogo size="md" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Get started in 30 seconds
          </h1>
          <p className="text-xs text-ink-secondary">
            Join India&apos;s creator collaboration network
          </p>
        </div>

        {/* Minimal 2-option Role Selector */}
        <div className="grid grid-cols-2 rounded-xl border border-border-strong bg-surface-elevated p-1 text-xs">
          <button
            type="button"
            onClick={() => setRole("CREATOR")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold transition-[color,background-color] duration-150 ${
              role === "CREATOR"
                ? "bg-[#FF5B00] text-white"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>I&apos;m a Creator</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("AGENCY")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold transition-[color,background-color] duration-150 ${
              role === "AGENCY"
                ? "bg-[#1D62EA] text-white"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>I&apos;m an Agency</span>
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-primary">
              {role === "CREATOR" ? "Your Name" : "Company / Brand Name"}
            </label>
            <input
              type="text"
              required
              placeholder={role === "CREATOR" ? "e.g. Rohan Sharma" : "e.g. Nexus Media / Brand"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 px-3.5 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-primary">Email Address</label>
            <input
              type="email"
              required
              placeholder={role === "CREATOR" ? "you@gmail.com" : "contact@company.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 px-3.5 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-primary">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 px-3.5 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
            />
          </div>

          <p className="text-[11px] text-ink-muted leading-relaxed">
            You can add social handles, GSTIN, and payment details later inside your settings.
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold text-white transition-transform active:scale-95 disabled:opacity-50 ${
              role === "CREATOR" ? "bg-[#FF5B00] hover:bg-[#ff6c1a]" : "bg-[#1D62EA] hover:bg-[#1a55cc]"
            }`}
          >
            <span>{loading ? "Creating..." : "Create Free Account"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#FF5B00] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70dvh] items-center justify-center text-xs text-ink-muted">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
