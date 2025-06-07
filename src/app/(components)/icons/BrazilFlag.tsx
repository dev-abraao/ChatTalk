import React from 'react';

interface BrazilFlagProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function BrazilFlag({ width = 20, height = 14, className = "" }: BrazilFlagProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 14"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="20" height="14" fill="#009739" />
      
      {/* Yellow diamond */}
      <path
        d="M10 2 L17 7 L10 12 L3 7 Z"
        fill="#FEDD00"
      />
      
      {/* Blue circle */}
      <circle
        cx="10"
        cy="7"
        r="2.5"
        fill="#012169"
      />
      
      {/* White banner (simplified) */}
      <path
        d="M8 7.5 L12 6.5"
        stroke="white"
        strokeWidth="0.4"
        fill="none"
      />
    </svg>
  );
}
