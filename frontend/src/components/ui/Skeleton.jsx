export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`ca-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-hover) 50%, var(--surface-2) 75%)',
        backgroundSize: '200% 100%',
        animation: 'ca-shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export function Kbd({ children, className = '' }) {
  return (
    <kbd
      className={`ca-kbd ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        fontSize: '0.7rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        color: 'var(--muted)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        boxShadow: '0 1px 0 var(--border)',
        lineHeight: 1,
      }}
    >
      {children}
    </kbd>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`ca-empty-state text-center py-5 px-4 ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            color: 'var(--muted)',
            marginBottom: '1rem',
            padding: '16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        >
          {icon}
        </div>
      )}
      {title && (
        <h4 style={{ fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text)' }}>
          {title}
        </h4>
      )}
      {description && (
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 0 1.25rem 0' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export function Tooltip({ text, children, position = 'top' }) {
  return (
    <span className="ca-tooltip-wrapper" style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      <span className={`ca-tooltip ca-tooltip-${position}`} role="tooltip">
        {text}
      </span>
    </span>
  );
}
