'use client';

import Box from '@mui/material/Box';

const SIZES = {
  small: 32,
  medium: 40,
  large: 48,
  xl: 64,
};

export function Logo({ size = 'medium', withBackground = true, sx }) {
  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.medium;

  return (
    <Box
      component="svg"
      viewBox="0 0 512 512"
      sx={{ width: px, height: px, display: 'block', flexShrink: 0, ...sx }}
      aria-label="English Pro logo"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="logo-page" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef2ff" />
        </linearGradient>
        <linearGradient id="logo-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="7" />
          <feOffset dy="5" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.22" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {withBackground && (
        <rect width="512" height="512" rx="116" fill="url(#logo-bg)" />
      )}

      {/* Open book — left spine + right pages forming the letter E */}
      <g filter="url(#logo-shadow)">
        {/* Left cover (book spine) — vertical bar of E */}
        <path
          d="M 128 168 L 168 168 L 168 392 L 128 392 Z"
          fill="url(#logo-page)"
        />
        {/* Top page (top bar of E) */}
        <path
          d="M 168 168 L 396 168 Q 408 168 408 180 L 408 224 Q 408 236 396 236 L 168 236 Z"
          fill="url(#logo-page)"
        />
        {/* Middle page (middle bar of E, shorter) */}
        <path
          d="M 168 268 L 336 268 Q 348 268 348 280 L 348 312 Q 348 324 336 324 L 168 324 Z"
          fill="url(#logo-page)"
        />
        {/* Bottom page (bottom bar of E) */}
        <path
          d="M 168 356 L 396 356 Q 408 356 408 368 L 408 380 Q 408 392 396 392 L 168 392 Z"
          fill="url(#logo-page)"
        />
        {/* Page lines — subtle text lines on pages for "book" feel */}
        <g opacity="0.32" stroke="#6366f1" strokeWidth="4" strokeLinecap="round">
          <line x1="190" y1="190" x2="370" y2="190" />
          <line x1="190" y1="210" x2="340" y2="210" />
          <line x1="190" y1="288" x2="318" y2="288" />
          <line x1="190" y1="304" x2="300" y2="304" />
          <line x1="190" y1="372" x2="370" y2="372" />
        </g>
      </g>

      {/* AI sparkle — main 4-point star with glow */}
      <g filter="url(#logo-glow)">
        <path
          d="M 388 84 Q 396 108, 420 116 Q 396 124, 388 148 Q 380 124, 356 116 Q 380 108, 388 84 Z"
          fill="url(#logo-sparkle)"
        />
      </g>
      {/* AI sparkle — smaller accent star */}
      <path
        d="M 444 156 Q 448 168, 460 172 Q 448 176, 444 188 Q 440 176, 428 172 Q 440 168, 444 156 Z"
        fill="#a5f3fc"
        opacity="0.9"
      />
    </Box>
  );
}

export default Logo;
