"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Lock, Mail } from "lucide-react";
import { CreateKarLogo } from "@/components/CreateKarLogo";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back! Signing you in...");
      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border-strong bg-surface p-8 sm:p-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <CreateKarLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Log in to CreateKar
          </h1>
          <p className="text-xs text-ink-secondary">
            Access your creator workspace, campaign escrow, and contracts
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-status-error/30 bg-status-error/10 p-3.5 text-xs text-status-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-primary">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-ink-primary">Password</label>
              <Link href="#" className="text-[11px] text-[#FF5B00] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF5B00] py-3 text-xs font-semibold text-white hover:bg-[#ff6c1a] active:scale-95 transition-transform disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Account"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-ink-muted">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-semibold text-[#FF5B00] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
