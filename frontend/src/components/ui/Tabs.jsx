export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}) {
  return (
    <div
      className={`ca-tabs ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'var(--surface-2)',
        padding: '3px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: size === 'sm' ? '4px 10px' : '6px 14px',
              fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text)' : 'var(--muted)',
              background: isActive ? 'var(--surface)' : 'transparent',
              borderRadius: 'calc(var(--radius) - 3px)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge != null && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--surface-2)' : 'var(--surface)',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
