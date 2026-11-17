import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          marginBottom: '20px',
        }}
      >
        <Compass size={36} />
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text)' }}>
        Page not found
      </h2>
      <p style={{ color: 'var(--muted)', maxWidth: '420px', margin: '0 0 28px 0', fontSize: '0.925rem' }}>
        The algorithm or route you are searching for does not exist in CodeArena.
      </p>

      <Link to="/problems">
        <Button variant="primary" size="md" iconRight={<ArrowRight size={16} />}>
          Explore Problems
        </Button>
      </Link>
    </div>
  );
}
