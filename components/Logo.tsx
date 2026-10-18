'use client';

import React from 'react';
import Link from 'next/link';

interface CreateKarLogoProps {
  className?: string;
  markOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export function CreateKarLogo({
  className = '',
  markOnly = false,
  size = 'md',
  href = '/',
}: CreateKarLogoProps) {
  const sizeMap = {
    sm: { mark: 'w-6 h-6', text: 'text-base', gap: 'gap-2' },
    md: { mark: 'w-8 h-8', text: 'text-xl', gap: 'gap-2.5' },
    lg: { mark: 'w-10 h-10', text: 'text-2xl', gap: 'gap-3' },
  };

  const { mark, text, gap } = sizeMap[size];

  const content = (
    <span className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* Modern Glowing Monogram Mark */}
      <span className="relative flex items-center justify-center">
        <span className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur-[2px] opacity-40 group-hover:opacity-75 transition duration-200" />
        <svg
          viewBox="0 0 32 32"
          className={`${mark} relative flex-shrink-0 drop-shadow-md`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="32" height="32" rx="8" fill="#11141D" />
          <rect width="32" height="32" rx="8" stroke="#232838" strokeWidth="1" />
          {/* C glyph */}
          <path
            d="M13 11H9.5C8.67157 11 8 11.6716 8 12.5V19.5C8 20.3284 8.67157 21 9.5 21H13"
            stroke="#F8FAFC"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* K glyph in Electric Indigo/Violet */}
          <path
            d="M17 10V22"
            stroke="url(#ck-gradient)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M23 11L17.5 16.5L23.5 22"
            stroke="url(#ck-gradient)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="ck-gradient" x1="17" y1="10" x2="23.5" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
      </span>

      {!markOnly && (
        <span className={`font-display font-extrabold tracking-tight flex items-baseline ${text}`}>
          <span className="text-white">Create</span>
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent ml-0.5">
            Kar
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1 inline-block animate-pulse" aria-hidden="true" />
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
