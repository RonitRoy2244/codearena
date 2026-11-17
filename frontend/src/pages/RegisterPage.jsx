import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!username.trim()) {
      errs.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/api/auth/register', {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      login(res.data.token, res.data.username, res.data.role);
      navigate('/problems', { replace: true });
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join CodeArena to start solving coding problems and tracking submissions."
    >
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--hard-bg)',
            border: '1px solid rgba(255, 77, 79, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            color: 'var(--hard)',
            fontSize: '0.85rem',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Username */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="username"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
              background: 'var(--surface-2)',
              border: `1px solid ${fieldErrors.username ? 'var(--hard)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={(e) => !fieldErrors.username && (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => !fieldErrors.username && (e.target.style.borderColor = 'var(--border)')}
          />
          {fieldErrors.username && (
            <span style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '4px', display: 'block' }}>
              {fieldErrors.username}
            </span>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
              background: 'var(--surface-2)',
              border: `1px solid ${fieldErrors.email ? 'var(--hard)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={(e) => !fieldErrors.email && (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => !fieldErrors.email && (e.target.style.borderColor = 'var(--border)')}
          />
          {fieldErrors.email && (
            <span style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '4px', display: 'block' }}>
              {fieldErrors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Password (min 6 characters)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              style={{
                width: '100%',
                height: '40px',
                padding: '0 40px 0 12px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                background: 'var(--surface-2)',
                border: `1px solid ${fieldErrors.password ? 'var(--hard)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => !fieldErrors.password && (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => !fieldErrors.password && (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && (
            <span style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '4px', display: 'block' }}>
              {fieldErrors.password}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            required
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
              background: 'var(--surface-2)',
              border: `1px solid ${fieldErrors.confirmPassword ? 'var(--hard)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={(e) => !fieldErrors.confirmPassword && (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => !fieldErrors.confirmPassword && (e.target.style.borderColor = 'var(--border)')}
          />
          {fieldErrors.confirmPassword && (
            <span style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '4px', display: 'block' }}>
              {fieldErrors.confirmPassword}
            </span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          style={{ width: '100%', height: '44px' }}
        >
          Create account
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--muted)' }}>
        Already have an account?{' '}
        <Link
          to="/login"
          style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
