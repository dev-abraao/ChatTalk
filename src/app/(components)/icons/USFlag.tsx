import React from 'react';

interface USFlagProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function USFlag({ width = 20, height = 14, className = "" }: USFlagProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 14"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red stripes */}
      <rect width="20" height="14" fill="#B22234" />
      
      {/* White stripes */}
      <rect y="1" width="20" height="1" fill="white" />
      <rect y="3" width="20" height="1" fill="white" />
      <rect y="5" width="20" height="1" fill="white" />
      <rect y="7" width="20" height="1" fill="white" />
      <rect y="9" width="20" height="1" fill="white" />
      <rect y="11" width="20" height="1" fill="white" />
      <rect y="13" width="20" height="1" fill="white" />
      
      {/* Blue canton */}
      <rect width="8" height="7" fill="#3C3B6E" />
      
      {/* Stars (simplified as small white circles) */}
      <circle cx="1.3" cy="0.8" r="0.15" fill="white" />
      <circle cx="2.6" cy="0.8" r="0.15" fill="white" />
      <circle cx="3.9" cy="0.8" r="0.15" fill="white" />
      <circle cx="5.2" cy="0.8" r="0.15" fill="white" />
      <circle cx="6.5" cy="0.8" r="0.15" fill="white" />
      
      <circle cx="2" cy="1.5" r="0.15" fill="white" />
      <circle cx="3.3" cy="1.5" r="0.15" fill="white" />
      <circle cx="4.6" cy="1.5" r="0.15" fill="white" />
      <circle cx="5.9" cy="1.5" r="0.15" fill="white" />
      
      <circle cx="1.3" cy="2.2" r="0.15" fill="white" />
      <circle cx="2.6" cy="2.2" r="0.15" fill="white" />
      <circle cx="3.9" cy="2.2" r="0.15" fill="white" />
      <circle cx="5.2" cy="2.2" r="0.15" fill="white" />
      <circle cx="6.5" cy="2.2" r="0.15" fill="white" />
      
      <circle cx="2" cy="2.9" r="0.15" fill="white" />
      <circle cx="3.3" cy="2.9" r="0.15" fill="white" />
      <circle cx="4.6" cy="2.9" r="0.15" fill="white" />
      <circle cx="5.9" cy="2.9" r="0.15" fill="white" />
      
      <circle cx="1.3" cy="3.6" r="0.15" fill="white" />
      <circle cx="2.6" cy="3.6" r="0.15" fill="white" />
      <circle cx="3.9" cy="3.6" r="0.15" fill="white" />
      <circle cx="5.2" cy="3.6" r="0.15" fill="white" />
      <circle cx="6.5" cy="3.6" r="0.15" fill="white" />
      
      <circle cx="2" cy="4.3" r="0.15" fill="white" />
      <circle cx="3.3" cy="4.3" r="0.15" fill="white" />
      <circle cx="4.6" cy="4.3" r="0.15" fill="white" />
      <circle cx="5.9" cy="4.3" r="0.15" fill="white" />
      
      <circle cx="1.3" cy="5" r="0.15" fill="white" />
      <circle cx="2.6" cy="5" r="0.15" fill="white" />
      <circle cx="3.9" cy="5" r="0.15" fill="white" />
      <circle cx="5.2" cy="5" r="0.15" fill="white" />
      <circle cx="6.5" cy="5" r="0.15" fill="white" />
      
      <circle cx="2" cy="5.7" r="0.15" fill="white" />
      <circle cx="3.3" cy="5.7" r="0.15" fill="white" />
      <circle cx="4.6" cy="5.7" r="0.15" fill="white" />
      <circle cx="5.9" cy="5.7" r="0.15" fill="white" />
      
      <circle cx="1.3" cy="6.4" r="0.15" fill="white" />
      <circle cx="2.6" cy="6.4" r="0.15" fill="white" />
      <circle cx="3.9" cy="6.4" r="0.15" fill="white" />
      <circle cx="5.2" cy="6.4" r="0.15" fill="white" />
      <circle cx="6.5" cy="6.4" r="0.15" fill="white" />
    </svg>
  );
}
