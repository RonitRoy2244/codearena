export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  style = {},
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          background: 'rgba(255, 161, 22, 0.15)',
          color: 'var(--accent)',
          border: '1px solid rgba(255, 161, 22, 0.3)',
        };
      case 'accent-2':
        return {
          background: 'rgba(124, 92, 255, 0.15)',
          color: 'var(--accent-2)',
          border: '1px solid rgba(124, 92, 255, 0.3)',
        };
      case 'success':
        return {
          background: 'var(--easy-bg)',
          color: 'var(--easy)',
          border: '1px solid rgba(44, 187, 93, 0.3)',
        };
      case 'danger':
        return {
          background: 'var(--hard-bg)',
          color: 'var(--hard)',
          border: '1px solid rgba(255, 77, 79, 0.3)',
        };
      case 'warning':
        return {
          background: 'var(--medium-bg)',
          color: 'var(--medium)',
          border: '1px solid rgba(255, 184, 0, 0.3)',
        };
      case 'muted':
        return {
          background: 'var(--surface-2)',
          color: 'var(--muted)',
          border: '1px solid var(--border)',
        };
      case 'default':
      default:
        return {
          background: 'var(--surface-2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        };
    }
  };

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.7rem' : '0.75rem';

  return (
    <span
      className={`ca-badge ca-badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        borderRadius: 'var(--radius-full)',
        lineHeight: 1.2,
        letterSpacing: '0.02em',
        padding,
        fontSize,
        ...getVariantStyles(),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function DifficultyPill({ difficulty, size = 'md', className = '' }) {
  const norm = (difficulty || '').toUpperCase();
  let color = 'var(--easy)';
  let bg = 'var(--easy-bg)';
  let border = 'rgba(44, 187, 93, 0.3)';
  let label = 'Easy';

  if (norm === 'MEDIUM') {
    color = 'var(--medium)';
    bg = 'var(--medium-bg)';
    border = 'rgba(255, 184, 0, 0.3)';
    label = 'Medium';
  } else if (norm === 'HARD') {
    color = 'var(--hard)';
    bg = 'var(--hard-bg)';
    border = 'rgba(255, 77, 79, 0.3)';
    label = 'Hard';
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.75rem' : '0.8125rem';

  return (
    <span
      className={`ca-difficulty-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        color,
        background: bg,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
        userSelect: 'none',
      }}
    >
      {label}
    </span>
  );
}

export default Badge;
