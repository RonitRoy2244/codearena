import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    loading = false,
    disabled = false,
    iconLeft,
    iconRight,
    className = '',
    style = {},
    type = 'button',
    ...props
  },
  ref
) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--accent-gradient)',
          color: '#ffffff',
          border: 'none',
          boxShadow: 'var(--glow-accent)',
        };
      case 'success':
        return {
          background: 'var(--easy)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 2px 8px rgba(44, 187, 93, 0.25)',
        };
      case 'danger':
        return {
          background: 'var(--hard)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 2px 8px rgba(255, 77, 79, 0.25)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid transparent',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        };
      case 'secondary':
      default:
        return {
          background: 'var(--surface-2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 12px',
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-sm)',
          gap: '6px',
        };
      case 'lg':
        return {
          padding: '12px 24px',
          fontSize: '1rem',
          borderRadius: 'var(--radius)',
          gap: '10px',
        };
      case 'md':
      default:
        return {
          padding: '8px 16px',
          fontSize: '0.875rem',
          borderRadius: 'var(--radius)',
          gap: '8px',
        };
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`ca-button ca-button-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        textDecoration: 'none',
        lineHeight: 1,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <Loader2 className="ca-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
});

export default Button;
