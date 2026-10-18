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
    sm: { box: 22, text: 'text-base', mark: 'w-5 h-5' },
    md: { box: 28, text: 'text-lg', mark: 'w-7 h-7' },
    lg: { box: 36, text: 'text-2xl', mark: 'w-9 h-9' },
  };

  const { text, mark } = sizeMap[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Octagonal Notarial Stamp Mark */}
      <svg
        viewBox="0 0 32 32"
        className={`${mark} flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="4" fill="#0B0F14" />
        <polygon
          points="9,3 23,3 29,9 29,23 23,29 9,29 3,23 3,9"
          fill="#0B0F14"
          stroke="#FBFBF9"
          strokeWidth="1.2"
        />
        <path
          d="M12 11H8V21H12"
          stroke="#FBFBF9"
          strokeWidth="2.5"
          strokeLinecap="square"
        />
        <path
          d="M15 11V21M22 11L15 16L22 21"
          stroke="#C83220"
          strokeWidth="2.5"
          strokeLinecap="square"
        />
      </svg>

      {!markOnly && (
        <span className={`font-display font-bold tracking-tight text-ink flex items-baseline ${text}`}>
          <span>CreateKar</span>
          <span className="w-1.5 h-1.5 rounded-none bg-seal ml-0.5 inline-block" aria-hidden="true" />
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default CreateKarLogo;
