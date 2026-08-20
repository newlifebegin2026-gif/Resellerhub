import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size, showText = false }) => {
  return (
    <div className={`inline-flex flex-col items-center justify-center ${showText ? 'gap-1' : ''}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={size ? { width: size, height: size } : undefined}
      >
        <defs>
          {/* Metallic Dark Gradients */}
          <linearGradient id="r_top_curve" x1="20" y1="30" x2="160" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B0F19" />
            <stop offset="45%" stopColor="#1E293B" />
            <stop offset="70%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="r_specular_gloss" x1="60" y1="35" x2="155" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="r_facet_left" x1="45" y1="65" x2="95" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="r_facet_dark" x1="50" y1="80" x2="95" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#090D16" />
          </linearGradient>

          {/* Intense Magenta / Pink Gradient for Brush Speed Streaks */}
          <linearGradient id="r_pink_streak" x1="90" y1="85" x2="185" y2="165" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#9D174D" />
            <stop offset="55%" stopColor="#E11D48" />
            <stop offset="85%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>

          <linearGradient id="r_pink_accent" x1="85" y1="90" x2="165" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>
        </defs>

        {/* --- 1. UPPER HOOD & LOOP (Aerodynamic Top Wing) --- */}
        {/* Top Wing / Loop Body */}
        <path
          d="M 45 42 L 125 42 C 158 42 168 62 168 76 C 168 96 150 110 118 110 L 98 110 C 92 110 88 106 88 100 L 88 82 C 88 78 92 74 96 74 L 120 74 C 132 74 136 68 136 62 C 136 56 128 54 116 54 L 72 54 Z"
          fill="url(#r_top_curve)"
        />

        {/* Gloss Specular Highlight Arch */}
        <path
          d="M 80 44 L 124 44 C 152 44 162 60 162 74 C 162 82 156 94 142 100 C 145 92 148 82 148 74 C 148 58 136 47 114 47 L 76 47 Z"
          fill="url(#r_specular_gloss)"
        />

        {/* Sharp Left Wing Extension */}
        <path
          d="M 45 42 L 78 54 L 45 74 Z"
          fill="#0B0F19"
        />

        {/* --- 2. FACETED ORIGAMI / 3D INNER SPINE --- */}
        {/* Left Vertical Spine Facet */}
        <path
          d="M 45 74 L 88 74 L 88 118 L 45 106 Z"
          fill="url(#r_facet_left)"
        />

        {/* Bottom Pointed Arrow Facet */}
        <path
          d="M 45 106 L 88 118 L 88 152 L 45 106 Z"
          fill="url(#r_facet_dark)"
        />

        {/* Inner Dark Wedge */}
        <path
          d="M 88 74 L 118 110 L 88 118 Z"
          fill="#020617"
        />

        {/* --- 3. DYNAMIC MAGENTA SPEED STREAKS & SPLATTER (Right Diagonal Leg) --- */}
        {/* Main Magenta Diagonal Thrust */}
        <path
          d="M 92 98 L 138 142 C 146 150 156 158 168 166 L 152 168 C 136 156 122 142 110 128 L 86 104 Z"
          fill="url(#r_pink_streak)"
        />

        {/* Speed streak accents */}
        <path
          d="M 108 112 L 174 168 L 164 171 L 102 116 Z"
          fill="url(#r_pink_accent)"
          opacity="0.9"
        />
        <path
          d="M 120 124 L 184 174 L 176 177 L 114 128 Z"
          fill="#F43F5E"
          opacity="0.85"
        />
        <path
          d="M 132 134 L 190 178 L 184 180 L 126 137 Z"
          fill="#FB7185"
          opacity="0.75"
        />

        {/* Brush Spatter Particles / Dots */}
        <circle cx="166" cy="148" r="2" fill="#F43F5E" />
        <circle cx="178" cy="156" r="1.5" fill="#FB7185" />
        <circle cx="158" cy="162" r="2.5" fill="#E11D48" />
        <circle cx="172" cy="168" r="1.8" fill="#F43F5E" />
        <circle cx="184" cy="164" r="1.2" fill="#FDA4AF" />
        <circle cx="148" cy="144" r="1.6" fill="#FB7185" />
        <circle cx="188" cy="172" r="1.4" fill="#F43F5E" />
        <circle cx="162" cy="174" r="2" fill="#E11D48" />
        <circle cx="176" cy="178" r="1.5" fill="#FB7185" />
      </svg>

      {showText && (
        <div className="flex flex-col items-center select-none text-center">
          <div className="flex items-center tracking-widest font-black text-sm text-slate-900 leading-none">
            <span className="text-pink-600">R</span>
            <span className="tracking-widest">ESELLER</span>
          </div>
          <div className="flex items-center gap-1.5 w-full justify-center mt-0.5">
            <div className="h-[1px] w-3 bg-pink-500/60" />
            <span className="text-[8px] font-bold tracking-[0.25em] text-slate-700 uppercase">
              PANEL
            </span>
            <div className="h-[1px] w-3 bg-pink-500/60" />
          </div>
        </div>
      )}
    </div>
  );
};
