"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle, Users, Building2, ShieldCheck } from "lucide-react";
import { CreateKarLogo } from "@/components/CreateKarLogo";
import { toast } from "sonner";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<"CREATOR" | "AGENCY">("CREATOR");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Creator specific fields
  const [niche, setNiche] = useState("Tech & AI");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [upiId, setUpiId] = useState("");

  // Agency specific fields
  const [companyName, setCompanyName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [gstin, setGstin] = useState("");
  const [tan, setTan] = useState("");

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

    if (!email || !password || !name) {
      setError("Please fill in all mandatory fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name,
        email,
        password,
        phone,
        role,
      };

      if (role === "CREATOR") {
        payload.niche = niche;
        payload.instagramHandle = instagramHandle;
        payload.upiId = upiId;
      } else {
        payload.companyName = companyName || name;
        payload.brandName = brandName;
        payload.gstin = gstin;
        payload.tan = tan;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your details.");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Welcome to CreateKar.");
      router.push(data.redirectUrl || (role === "CREATOR" ? "/dashboard" : "/agency/dashboard"));
      router.refresh();
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85dvh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-border-strong bg-surface p-8 sm:p-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <CreateKarLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="text-xs text-ink-secondary">
            Join India&apos;s leading creator collaboration and escrow platform
          </p>
        </div>

        {/* Role Switcher Pill */}
        <div className="grid grid-cols-2 rounded-xl border border-border-strong bg-surface-elevated p-1 text-xs">
          <button
            type="button"
            onClick={() => setRole("CREATOR")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold transition-[color,background-color] duration-200 ${
              role === "CREATOR"
                ? "bg-[#FF5B00] text-white"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>I am a Creator</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("AGENCY")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold transition-[color,background-color] duration-200 ${
              role === "AGENCY"
                ? "bg-[#1D62EA] text-white"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>I am an Agency</span>
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-status-error/30 bg-status-error/10 p-3.5 text-xs text-status-error">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-primary">
                {role === "CREATOR" ? "Full Legal Name *" : "Contact Person Name *"}
              </label>
              <input
                type="text"
                required
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-primary">
                {role === "CREATOR" ? "Personal Email *" : "Work Email *"}
              </label>
              <input
                type="email"
                required
                placeholder="rohan@creator.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-primary">Password (min 6 chars) *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-primary">Mobile Phone (for OTP)</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
              />
            </div>
          </div>

          {/* Role specific inputs */}
          {role === "CREATOR" ? (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-primary">Content Niche</label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white focus:border-[#FF5B00] focus:outline-none"
                  >
                    <option value="Tech & AI">Tech &amp; AI</option>
                    <option value="Finance & Crypto">Finance &amp; Crypto</option>
                    <option value="Lifestyle & Travel">Lifestyle &amp; Travel</option>
                    <option value="Fitness & Nutrition">Fitness &amp; Nutrition</option>
                    <option value="Fashion & Beauty">Fashion &amp; Beauty</option>
                    <option value="Gaming & Esports">Gaming &amp; Esports</option>
                    <option value="Food & Cooking">Food &amp; Cooking</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-primary">Instagram / YouTube Handle</label>
                  <input
                    type="text"
                    placeholder="@rohan_creates"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-primary">
                  UPI ID (for Direct P2P Payouts - Optional)
                </label>
                <input
                  type="text"
                  placeholder="rohan@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#FF5B00] focus:outline-none focus:ring-1 focus:ring-[#FF5B00]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-primary">Company / Agency Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nexus Media Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#1D62EA] focus:outline-none focus:ring-1 focus:ring-[#1D62EA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-primary">Brand Name (if direct)</label>
                  <input
                    type="text"
                    placeholder="Nexus Energy"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#1D62EA] focus:outline-none focus:ring-1 focus:ring-[#1D62EA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-primary">Company GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="29AABCN1234F1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#1D62EA] focus:outline-none focus:ring-1 focus:ring-[#1D62EA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-primary">TAN (for TDS Deductions - Optional)</label>
                  <input
                    type="text"
                    placeholder="BLRN12345D"
                    value={tan}
                    onChange={(e) => setTan(e.target.value)}
                    className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 px-3 text-xs text-white placeholder-ink-muted focus:border-[#1D62EA] focus:outline-none focus:ring-1 focus:ring-[#1D62EA]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 text-[11px] text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-[#FF5B00] shrink-0" />
            <span>
              By continuing, you accept CreateKar&apos;s{" "}
              <Link href="/terms" className="text-[#FF5B00] underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#FF5B00] underline">
                DPDP Privacy Policy
              </Link>
              .
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold text-white transition-transform active:scale-95 disabled:opacity-50 ${
              role === "CREATOR" ? "bg-[#FF5B00] hover:bg-[#ff6c1a]" : "bg-[#1D62EA] hover:bg-[#1a55cc]"
            }`}
          >
            <span>{loading ? "Creating Account..." : `Register as ${role === "CREATOR" ? "Creator" : "Agency"}`}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-ink-muted">
          Already registered?{" "}
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
    <Suspense fallback={<div className="flex min-h-[70dvh] items-center justify-center text-xs text-ink-muted">Loading registration...</div>}>
      <SignupContent />
    </Suspense>
  );
}
