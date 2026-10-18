import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CreateKar — Premium Commercial Dealflow for Creators & Brands',
  description: 'Direct bilateral contracts, 0% creator commission, automated GST compliance, and cryptographic SHA-256 execution seals.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} bg-dark text-slate-100 font-sans antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-300`}
      >
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#11141D',
              color: '#F8FAFC',
              border: '1px solid #232838',
              borderRadius: '12px',
              fontFamily: 'var(--font-sans)',
            },
          }}
          closeButton
        />
      </body>
    </html>
  );
}
