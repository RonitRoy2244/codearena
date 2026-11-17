import Logo from '../ui/Logo';
import { CheckCircle2, Zap, ShieldCheck, Terminal } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1020px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Left Side: Gradient Art Panel */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(255, 161, 22, 0.08) 0%, rgba(124, 92, 255, 0.15) 100%)',
            borderRight: '1px solid var(--border)',
            padding: '48px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Top Logo & Pitch */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <Logo size="lg" />
            </div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.25,
                margin: '0 0 12px 0',
                color: 'var(--text)',
              }}
            >
              Master the algorithm. <br />
              <span className="text-gradient">Get judged instantly.</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.925rem', margin: 0, lineHeight: 1.6 }}>
              Run and submit code in JavaScript and Java with sub-second feedback, real-time verdicts, and clean runtime analysis.
            </p>
          </div>

          {/* Floating Code Snippet Card */}
          <div
            style={{
              margin: '36px 0',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--easy)',
                  background: 'var(--easy-bg)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <CheckCircle2 size={12} /> Accepted (42ms)
              </span>
            </div>

            <pre
              style={{
                margin: 0,
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text)',
                lineHeight: 1.5,
              }}
            >
              <code>
                <span style={{ color: '#7c5cff' }}>function</span> <span style={{ color: '#ffa116' }}>twoSum</span>(nums, target) &#123;{'\n'}
                {'  '}const map = new Map();{'\n'}
                {'  '}for (let i = 0; i &lt; nums.length; i++) &#123;{'\n'}
                {'    '}const diff = target - nums[i];{'\n'}
                {'    '}if (map.has(diff)) return [map.get(diff), i];{'\n'}
                {'    '}map.set(nums[i], i);{'\n'}
                {'  '}&#125;{'\n'}
                &#125;
              </code>
            </pre>
          </div>

          {/* Bottom Perks */}
          <div style={{ display: 'flex', gap: '20px', color: 'var(--muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} style={{ color: 'var(--accent)' }} /> Zero delay
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} style={{ color: 'var(--accent-2)' }} /> Real runtime
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} style={{ color: 'var(--easy)' }} /> Safe sandbox
            </span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div style={{ padding: '48px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text)' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
