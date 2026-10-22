import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StickyMobileCta } from "@/components/StickyMobileCta";
import { CookieBanner } from "@/components/CookieBanner";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://createkar.com"),
  title: {
    default: "CreateKar • Sovereign Creator Campaign Escrow & Contracts",
    template: "%s | CreateKar",
  },
  description:
    "Protect creator collaborations with automated milestone escrow, Aadhaar e-signed contracts, GST invoices, and zero-delay payouts for agencies and creators across India.",
  keywords: [
    "creator escrow",
    "influencer contracts",
    "creator payments india",
    "aadhaar e-sign creator agreement",
    "gst invoice for creators",
    "influencer marketing deal room",
  ],
  authors: [{ name: "CreateKar Technologies Pvt Ltd" }],
  creator: "CreateKar",
  publisher: "CreateKar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://createkar.com",
    siteName: "CreateKar",
    title: "CreateKar • Sovereign Creator Campaign Escrow & Contracts",
    description:
      "Automated milestone escrow, legally binding contracts, and GST-ready invoices for India's top creators and agencies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreateKar • Sovereign Creator Campaign Escrow & Contracts",
    description:
      "No delayed payments. No ambiguous briefs. Milestone escrow and Aadhaar e-signs for creators and agencies.",
    creator: "@createkar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-[100dvh] bg-background text-ink-primary flex flex-col font-sans antialiased">
        <AnalyticsTracker />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyMobileCta />
        <CookieBanner />
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
