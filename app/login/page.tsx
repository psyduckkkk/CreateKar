"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
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
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
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
            Welcome back
          </h1>
          <p className="text-xs text-ink-secondary">
            Sign in to access your contracts and payouts
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-primary">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 px-3.5 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-ink-primary">Password</label>
              <Link href="#" className="text-[11px] text-[#FF5B00] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 px-3.5 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF5B00] py-3 text-xs font-semibold text-white hover:bg-[#ff6c1a] active:scale-95 transition-transform disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-ink-muted">
          New to CreateKar?{" "}
          <Link href="/signup" className="font-semibold text-[#FF5B00] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
