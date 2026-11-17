export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  style = {},
  ...props
}) {
  return (
    <div
      className={`ca-card ${hover ? 'ca-card-hover' : ''} ${className}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: glow ? 'var(--glow)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
