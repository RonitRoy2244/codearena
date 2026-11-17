import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './ui/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CodeArena Global Error Boundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            color: 'var(--text)',
            padding: '40px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--hard-bg)',
              color: 'var(--hard)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(255, 77, 79, 0.3)',
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 10px 0' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: '460px', margin: '0 0 24px 0', fontSize: '0.9rem' }}>
            An unexpected error occurred while rendering this interface. Please try refreshing or returning home.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="primary" size="md" onClick={this.handleReload} iconLeft={<RotateCcw size={15} />}>
              Reload page
            </Button>
            <a href="/" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="md">
                Go to Home
              </Button>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
