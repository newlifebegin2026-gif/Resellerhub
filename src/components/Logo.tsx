import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Outer Blue Track (Spine & Top Arch) */}
      <path
        d="M 24 82 V 18 H 60 C 72 18 80 26 80 38 C 80 44 76 50 70 54"
        stroke="#2563EB"
        strokeWidth="6.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/* Red Geometric Upper Core */}
      <path
        d="M 33 50 V 27 H 60 C 66 27 72 32 72 38 C 72 44 67 48 60 48 H 33"
        stroke="#DC2626"
        strokeWidth="6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M 33 27 L 54 48"
        stroke="#DC2626"
        strokeWidth="5.5"
        strokeLinecap="square"
      />

      {/* Yellow / Amber Diagonal & Lower Inner Line */}
      <path
        d="M 33 82 V 56 L 62 27"
        stroke="#F59E0B"
        strokeWidth="6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M 43 82 V 62 L 67 38"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="square"
      />

      {/* Green Diagonal Right Leg Tracks */}
      <path
        d="M 48 56 L 76 82"
        stroke="#16A34A"
        strokeWidth="6.5"
        strokeLinecap="square"
      />
      <path
        d="M 58 48 L 86 76 C 88 78 88 82 82 82 H 72"
        stroke="#16A34A"
        strokeWidth="6.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
};
