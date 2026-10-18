import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
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
  title: 'CreateKar - Sovereign Commercial Infrastructure for Creators & Agencies',
  description: 'Direct bilateral contracts, zero percent platform commission, automated GST compliance, and court-admissible SHA-256 digital execution seals.',
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
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} bg-paper text-ink font-sans antialiased min-h-screen selection:bg-seal-light selection:text-seal`}
      >
        {children}
        <Toaster
          position="top-right"
          theme="light"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#0B0F14',
              border: '1px solid #E2E2DC',
              borderRadius: '6px',
              fontFamily: 'var(--font-sans)',
            },
          }}
          closeButton
        />
      </body>
    </html>
  );
}
