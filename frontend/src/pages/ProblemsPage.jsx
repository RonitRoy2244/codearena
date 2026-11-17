import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Circle,
  Calendar,
  ArrowRight,
  Filter,
  Trophy,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { DifficultyPill } from '../components/ui/Badge';
import { Skeleton, EmptyState } from '../components/ui/Skeleton';

export default function ProblemsPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [problems, setProblems] = useState([]);
  const [solvedSlugs, setSolvedSlugs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL'); // ALL | EASY | MEDIUM | HARD
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | SOLVED | UNSOLVED

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const probRes = await api.get('/api/problems');
      setProblems(probRes.data || []);

      if (isAuthenticated) {
        try {
          const subRes = await api.get('/api/submissions/me');
          const solved = new Set(
            (subRes.data || [])
              .filter((s) => s.status === 'ACCEPTED')
              .map((s) => s.problemSlug)
          );
          setSolvedSlugs(solved);
        } catch {
          // If submissions fail, keep empty solved set
          setSolvedSlugs(new Set());
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Search filter
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search);

      // Difficulty filter
      const matchesDiff =
        difficultyFilter === 'ALL' ||
        (p.difficulty || '').toUpperCase() === difficultyFilter;

      // Status filter
      let matchesStatus = true;
      if (isAuthenticated && statusFilter !== 'ALL') {
        const isSolved = solvedSlugs.has(p.slug);
        matchesStatus = statusFilter === 'SOLVED' ? isSolved : !isSolved;
      }

      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [problems, search, difficultyFilter, statusFilter, solvedSlugs, isAuthenticated]);

  // Progress stats calculation
  const stats = useMemo(() => {
    const total = problems.length;
    const solved = solvedSlugs.size;
    const easyTotal = problems.filter((p) => (p.difficulty || '').toUpperCase() === 'EASY').length;
    const medTotal = problems.filter((p) => (p.difficulty || '').toUpperCase() === 'MEDIUM').length;
    const hardTotal = problems.filter((p) => (p.difficulty || '').toUpperCase() === 'HARD').length;

    const easySolved = problems.filter(
      (p) => (p.difficulty || '').toUpperCase() === 'EASY' && solvedSlugs.has(p.slug)
    ).length;
    const medSolved = problems.filter(
      (p) => (p.difficulty || '').toUpperCase() === 'MEDIUM' && solvedSlugs.has(p.slug)
    ).length;
    const hardSolved = problems.filter(
      (p) => (p.difficulty || '').toUpperCase() === 'HARD' && solvedSlugs.has(p.slug)
    ).length;

    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

    return { total, solved, easyTotal, medTotal, hardTotal, easySolved, medSolved, hardSolved, percent };
  }, [problems, solvedSlugs]);

  // Deterministic daily pick based on date
  const dailyPick = useMemo(() => {
    if (problems.length === 0) return null;
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    return problems[dayOfYear % problems.length];
  }, [problems]);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 20px', width: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Problem Archive
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
          Sharpen your coding skills with instant compilation, time-limit enforcement, and hidden test suites.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--hard-bg)',
            border: '1px solid rgba(255, 77, 79, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            color: 'var(--hard)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={fetchData}>
            Retry
          </Button>
        </div>
      )}

      {/* Two Column Layout on Desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '28px',
          alignItems: 'start',
        }}
        className="problems-layout-grid"
      >
        {/* LEFT COLUMN: Filters + Problems Table */}
        <div>
          {/* Filter Bar */}
          <Card style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by title or #ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px 0 34px',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-sans)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Difficulty Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => {
                  const isSelected = difficultyFilter === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficultyFilter(diff)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                        background: isSelected ? 'var(--surface-2)' : 'transparent',
                        color: isSelected ? 'var(--accent)' : 'var(--muted)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {diff === 'ALL' ? 'All Difficulties' : diff.charAt(0) + diff.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>

              {/* Status Chips (if logged in) */}
              {isAuthenticated && (
                <div style={{ display: 'flex', gap: '6px', borderLeft: '1px solid var(--border)', paddingLeft: '8px' }}>
                  {['ALL', 'SOLVED', 'UNSOLVED'].map((st) => {
                    const isSelected = statusFilter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--easy)' : 'var(--border)',
                          background: isSelected ? 'var(--easy-bg)' : 'transparent',
                          color: isSelected ? 'var(--easy)' : 'var(--muted)',
                          cursor: 'pointer',
                        }}
                      >
                        {st.charAt(0) + st.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Results counter */}
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>
                Showing <strong>{filteredProblems.length}</strong> of <strong>{problems.length}</strong> problems
              </span>
              {(search || difficultyFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setDifficultyFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>
          </Card>

          {/* Problems Table */}
          <Card style={{ overflow: 'hidden' }}>
            <div className="table-responsive" style={{ margin: 0 }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      color: 'var(--muted)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <th style={{ padding: '12px 16px', width: '50px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}># Title</th>
                    <th style={{ padding: '12px 16px', width: '130px' }}>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <Skeleton width="18px" height="18px" borderRadius="50%" />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <Skeleton width="220px" height="16px" />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <Skeleton width="60px" height="20px" borderRadius="10px" />
                        </td>
                      </tr>
                    ))
                  ) : filteredProblems.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '40px 16px' }}>
                        <EmptyState
                          icon={<Filter size={24} />}
                          title="No problems found"
                          description="Try clearing your search query or adjusting the difficulty filters."
                          action={
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSearch('');
                                setDifficultyFilter('ALL');
                                setStatusFilter('ALL');
                              }}
                            >
                              Reset filters
                            </Button>
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map((prob, idx) => {
                      const isSolved = solvedSlugs.has(prob.slug);
                      return (
                        <tr
                          key={prob.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: idx % 2 === 1 ? 'var(--surface-2)' : 'transparent',
                            transition: 'background var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = idx % 2 === 1 ? 'var(--surface-2)' : 'transparent')
                          }
                        >
                          {/* Status */}
                          <td style={{ padding: '14px 16px' }}>
                            {isSolved ? (
                              <CheckCircle2 size={18} style={{ color: 'var(--easy)' }} />
                            ) : (
                              <Circle size={18} style={{ color: 'var(--border)' }} />
                            )}
                          </td>

                          {/* Title */}
                          <td style={{ padding: '14px 16px' }}>
                            <Link
                              to={`/problems/${prob.slug}`}
                              style={{
                                color: 'var(--text)',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                                #{prob.id}
                              </span>
                              <span>{prob.title}</span>
                            </Link>
                          </td>

                          {/* Difficulty */}
                          <td style={{ padding: '14px 16px' }}>
                            <DifficultyPill difficulty={prob.difficulty} size="sm" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sidebar (Progress Ring & Daily Pick) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Progress Card with SVG Ring */}
          <Card style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={16} style={{ color: 'var(--accent)' }} /> Problem Solving
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                {stats.solved} / {stats.total} Solved
              </span>
            </div>

            {/* SVG Progress Ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="var(--surface-2)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="var(--accent)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * stats.percent) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
                    {stats.percent}%
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Solved
                  </span>
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--easy)', fontWeight: 600 }}>Easy</span>
                  <span style={{ color: 'var(--text)' }}>
                    {stats.easySolved} / {stats.easyTotal}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--medium)', fontWeight: 600 }}>Medium</span>
                  <span style={{ color: 'var(--text)' }}>
                    {stats.medSolved} / {stats.medTotal}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--hard)', fontWeight: 600 }}>Hard</span>
                  <span style={{ color: 'var(--text)' }}>
                    {stats.hardSolved} / {stats.hardTotal}
                  </span>
                </div>
              </div>
            </div>

            {!isAuthenticated && (
              <div
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '12px',
                  fontSize: '0.8rem',
                  color: 'var(--muted)',
                  textAlign: 'center',
                }}
              >
                <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>{' '}
                to record your progress and track real submission history.
              </div>
            )}
          </Card>

          {/* Daily Pick Card */}
          {dailyPick && (
            <Card hover style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                <Calendar size={14} /> Daily Pick
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                  {dailyPick.title}
                </h4>
                <DifficultyPill difficulty={dailyPick.difficulty} size="sm" />
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Challenge yourself with today's featured algorithmic puzzle.
              </p>

              <Link to={`/problems/${dailyPick.slug}`} style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" style={{ width: '100%' }} iconRight={<ArrowRight size={14} />}>
                  Solve Today's Pick
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .problems-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
