'use client';

import React from 'react';
import Link from 'next/link';

interface CreateKarLogoProps {
  className?: string;
  markOnly?: boolean;
  showTagline?: boolean;
  variant?: 'dark' | 'light' | 'mono';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}

export function CreateKarLogo({
  className = '',
  markOnly = false,
  showTagline = false,
  variant = 'dark',
  size = 'md',
  href = '/',
}: CreateKarLogoProps) {
  // Proportional sizing tokens
  const sizeMap = {
    sm: { mark: 'w-6 h-5', text: 'text-base', tagline: 'text-[9px]', gap: 'gap-2' },
    md: { mark: 'w-8 h-7', text: 'text-xl', tagline: 'text-[10px]', gap: 'gap-2.5' },
    lg: { mark: 'w-10 h-8.5', text: 'text-2xl', tagline: 'text-[11px]', gap: 'gap-3' },
    xl: { mark: 'w-14 h-12', text: 'text-3xl', tagline: 'text-[12px]', gap: 'gap-3.5' },
  };

  const { mark, text, tagline, gap } = sizeMap[size];

  // Colors based on variant
  const isMono = variant === 'mono';
  const isLight = variant === 'light';

  const cColor = isMono ? 'currentColor' : '#1D62EA'; // Cobalt Blue
  const kColor = isMono ? 'currentColor' : '#FF5B00'; // Electric Tangerine
  const createColor = isMono
    ? 'currentColor'
    : isLight
    ? 'text-[#0D0F14]'
    : 'text-white';
  const karColor = isMono
    ? 'currentColor'
    : 'text-[#FF5B00]';
  const taglineColor = isLight ? 'text-[#6B7280]' : 'text-[#8E98A8]';

  const content = (
    <span className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* Official Interlocking 'CK' Geometric Monogram */}
      <svg
        viewBox="0 0 140 120"
        className={`${mark} flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CreateKar Monogram"
      >
        {/* Cobalt Blue C Arc (270° sweep, 45° angled terminal cuts) */}
        <path
          d="M 89.70 30.30 L 102.43 17.57 A 60 60 0 1 0 102.43 102.43 L 89.70 89.70 A 42 42 0 1 1 89.70 30.30 Z"
          fill={cColor}
        />
        {/* Electric Tangerine K - Upper Stem Segment */}
        <path
          d="M 60 60 L 60 28.75 A 31.25 31.25 0 0 1 78 34.46 V 42 L 60 60 Z"
          fill={kColor}
        />
        {/* Electric Tangerine K - Main Body (Diagonal Arms & Lower Stem) */}
        <path
          d="M 60 75 L 117 18 H 140 L 98 60 L 140 102 H 117 L 75 60 L 78 63 V 85.54 A 31.25 31.25 0 0 1 60 91.25 V 75 Z"
          fill={kColor}
        />
      </svg>

      {!markOnly && (
        <span className="flex flex-col">
          <span className={`font-display font-bold tracking-tight leading-none ${text}`}>
            <span className={createColor}>Create</span>
            <span className={karColor}>Kar</span>
          </span>
          {showTagline && (
            <span
              className={`font-sans uppercase tracking-[0.18em] font-semibold mt-1 leading-tight ${tagline} ${taglineColor}`}
            >
              Create fearlessly. Get paid securely.
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none group">
        {content}
      </Link>
    );
  }

  return content;
}

export default CreateKarLogo;
