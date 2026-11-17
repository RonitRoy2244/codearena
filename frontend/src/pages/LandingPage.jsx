import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  Zap,
  ShieldCheck,
  History,
  Timer,
  Lock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { DifficultyPill } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animated Code Mockup typing state
  const codeSnippet = `function sumOfTwo(a, b) {
  // Read stdin & return sum
  return a + b;
}
console.log(sumOfTwo(10, 20));`;

  const [displayedCode, setDisplayedCode] = useState('');
  const [showAccepted, setShowAccepted] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedCode(codeSnippet.slice(0, i));
      i++;
      if (i > codeSnippet.length) {
        clearInterval(interval);
        setTimeout(() => setShowAccepted(true), 400);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Fetch real problems for stats and "Try a problem"
  useEffect(() => {
    api.get('/api/problems')
      .then((res) => {
        setProblems(res.data || []);
      })
      .catch(() => {
        setProblems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const features = [
    {
      icon: <ShieldCheck size={22} style={{ color: 'var(--easy)' }} />,
      title: 'Hidden Test Cases',
      desc: 'Verify solutions against comprehensive secret test suites to test true algorithmic robustness.',
    },
    {
      icon: <Zap size={22} style={{ color: 'var(--accent)' }} />,
      title: 'Instant Verdicts',
      desc: 'Sub-second code compilation and execution with zero cold-starts or delayed queueing.',
    },
    {
      icon: <Code2 size={22} style={{ color: 'var(--accent-2)' }} />,
      title: 'Monaco Code Editor',
      desc: 'Full VS Code editing experience with syntax highlighting, bracket matching, and multi-language support.',
    },
    {
      icon: <History size={22} style={{ color: '#38bdf8' }} />,
      title: 'Submission History',
      desc: 'Inspect past submissions, view read-only historical code snapshots, and analyze runtime performance.',
    },
    {
      icon: <Timer size={22} style={{ color: 'var(--medium)' }} />,
      title: 'Time-Limit Enforcement',
      desc: 'Accurate process timeouts with deep process-tree termination to prevent rogue infinite loops.',
    },
    {
      icon: <Lock size={22} style={{ color: 'var(--hard)' }} />,
      title: 'Role-Based Access',
      desc: 'Secure stateless JWT authentication with administrative APIs for problem authoring and test case setup.',
    },
  ];

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          padding: '72px 24px 60px',
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 161, 22, 0.1)',
              border: '1px solid rgba(255, 161, 22, 0.25)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--accent)',
              marginBottom: '20px',
            }}
          >
            <Sparkles size={14} /> Modern LeetCode-style Judge
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 20px 0',
            }}
          >
            Practice. Submit.{' '}
            <span className="text-gradient">Get judged instantly.</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--muted)',
              lineHeight: 1.6,
              margin: '0 0 32px 0',
              maxWidth: '540px',
            }}
          >
            Hone your algorithmic problem-solving in JavaScript and Java. Run code against sample cases, evaluate hidden test suites, and inspect real execution times.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            <Link to="/problems">
              <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
                {isAuthenticated ? 'Continue practicing' : 'Start solving'}
              </Button>
            </Link>
            <a
              href="https://github.com/RonitRoy2244/codearena"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="secondary" size="lg" iconRight={<ExternalLink size={16} />}>
                View source on GitHub
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Hero Code Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ position: 'relative' }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--glow)',
              overflow: 'hidden',
            }}
          >
            {/* Window Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--surface-2)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                solution.js &mdash; JavaScript
              </span>
              <span style={{ width: '30px' }} />
            </div>

            {/* Code Body */}
            <div style={{ padding: '20px', minHeight: '180px', background: 'var(--code-bg)' }}>
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                }}
              >
                <code>{displayedCode}</code>
                <span style={{ animation: 'ca-spin 1s infinite', borderLeft: '2px solid var(--accent)' }}>&nbsp;</span>
              </pre>
            </div>

            {/* Bottom Status Chip */}
            <div
              style={{
                padding: '12px 20px',
                background: 'var(--surface-2)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Evaluating test cases 1..6
              </span>
              {showAccepted ? (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--easy)',
                    background: 'var(--easy-bg)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(44, 187, 93, 0.3)',
                  }}
                >
                  <CheckCircle2 size={14} /> Accepted (35ms)
                </motion.span>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                  Judging...
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. STATS STRIP */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '28px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
              {loading ? '...' : problems.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
              Curated Problems
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-2)' }}>
              2
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
              Languages (JS &bull; Java)
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--easy)' }}>
              5
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
              Verdict Classifications
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
              &lt; 50ms
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
              Average Evaluation Time
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3x2 FEATURE GRID */}
      <section style={{ padding: '80px 24px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
            Built for competitive coding & precision
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
            Every component is engineered to mimic high-performance coding interview judges.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {features.map((feat, idx) => (
            <Card key={idx} hover style={{ padding: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text)' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                {feat.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. "TRY A PROBLEM" SECTION */}
      <section
        style={{
          padding: '60px 24px 80px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '36px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>
                Featured Problems
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
                Jump right in and submit your first solution in under 2 minutes.
              </p>
            </div>
            <Link to="/problems">
              <Button variant="ghost" iconRight={<ArrowRight size={16} />}>
                View all problems
              </Button>
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {loading ? (
              [1, 2, 3].map((n) => (
                <Card key={n} style={{ padding: '24px' }}>
                  <Skeleton height="24px" width="70%" style={{ marginBottom: '12px' }} />
                  <Skeleton height="16px" width="40%" style={{ marginBottom: '20px' }} />
                  <Skeleton height="36px" width="100%" />
                </Card>
              ))
            ) : (
              problems.slice(0, 3).map((prob) => (
                <Card key={prob.id} hover style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        #{prob.id}
                      </span>
                      <DifficultyPill difficulty={prob.difficulty} size="sm" />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text)' }}>
                      {prob.title}
                    </h3>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <Link to={`/problems/${prob.slug}`} style={{ textDecoration: 'none' }}>
                      <Button variant="secondary" size="sm" style={{ width: '100%' }} iconRight={<ArrowRight size={14} />}>
                        Solve Challenge
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
