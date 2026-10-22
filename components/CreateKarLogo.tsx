"use client";

import Link from "next/link";

interface CreateKarLogoProps {
  className?: string;
  markOnly?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function CreateKarLogo({
  className = "",
  markOnly = false,
  showTagline = false,
  size = "md",
  href = "/",
}: CreateKarLogoProps) {
  const sizeMap = {
    sm: { mark: "w-6 h-5", text: "text-lg", tagline: "text-[9px]" },
    md: { mark: "w-8 h-7", text: "text-xl", tagline: "text-[10px]" },
    lg: { mark: "w-10 h-9", text: "text-2xl", tagline: "text-xs" },
  };

  const currentSize = sizeMap[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Interlocking 'CK' Geometric Monogram */}
      <svg
        viewBox="0 0 140 120"
        className={`${currentSize.mark} flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CreateKar Monogram"
      >
        {/* Cobalt Blue C Arc */}
        <path
          d="M 89.70 30.30 L 102.43 17.57 A 60 60 0 1 0 102.43 102.43 L 89.70 89.70 A 42 42 0 1 1 89.70 30.30 Z"
          fill="#1D62EA"
        />
        {/* Electric Tangerine K - Upper Stem Segment */}
        <path
          d="M 60 60 L 60 28.75 A 31.25 31.25 0 0 1 78 34.46 V 42 L 60 60 Z"
          fill="#FF5B00"
        />
        {/* Electric Tangerine K - Main Body */}
        <path
          d="M 60 75 L 117 18 H 140 L 98 60 L 140 102 H 117 L 75 60 L 78 63 V 85.54 A 31.25 31.25 0 0 1 60 91.25 V 75 Z"
          fill="#FF5B00"
        />
      </svg>

      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-white ${currentSize.text}`}>
            Create<span className="text-[#FF5B00]">Kar</span>
          </span>
          {showTagline && (
            <span
              className={`tracking-wider uppercase font-medium text-ink-muted mt-1 ${currentSize.tagline}`}
            >
              Collab fearlessly. Get paid safely.
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
