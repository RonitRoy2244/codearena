import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', to = '/', showWordmark = true }) {
  const dimensions = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;
  const textSize = size === 'sm' ? '1rem' : size === 'lg' ? '1.4rem' : '1.15rem';

  const mark = (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-label="CodeArena Logo"
    >
      <defs>
        <linearGradient id="ca-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffa116" />
          <stop offset="100%" stop-color="#7c5cff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#ca-logo-grad)" />
      <path
        d="M10 11L5 16L10 21M22 11L27 16L22 21M18 9L14 23"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const content = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
      {mark}
      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: textSize,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Code<span style={{ color: 'var(--accent)' }}>Arena</span>
        </span>
      )}
    </span>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
        {content}
      </Link>
    );
  }

  return content;
}
