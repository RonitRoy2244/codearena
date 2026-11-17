import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  ListFilter,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Skeleton, EmptyState } from '../components/ui/Skeleton';

export default function SubmissionsPage() {
  const { isDark } = useTheme();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verdict filter
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Code Drawer
  const [selectedSub, setSelectedSub] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'My Submissions | CodeArena';
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/submissions/me');
      setSubmissions(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleRowClick = async (sub) => {
    setLoadingCode(true);
    setSelectedSub(sub);
    try {
      const res = await api.get(`/api/submissions/${sub.id}`);
      setSelectedSub(res.data);
    } catch (err) {
      toast.error('Failed to load submission source code');
    } finally {
      setLoadingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (selectedSub?.sourceCode) {
      navigator.clipboard.writeText(selectedSub.sourceCode);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (verdictFilter === 'ALL') return submissions;
    return submissions.filter((s) => s.status === verdictFilter);
  }, [submissions, verdictFilter]);

  const totalPages = Math.ceil(filteredSubmissions.length / pageSize) || 1;
  const paginatedSubmissions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, page]);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  const getVerdictBadge = (verdict) => {
    const isAccepted = verdict === 'ACCEPTED';
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 700,
          background: isAccepted ? 'var(--easy-bg)' : 'var(--hard-bg)',
          color: isAccepted ? 'var(--easy)' : 'var(--hard)',
          border: `1px solid ${isAccepted ? 'rgba(44, 187, 93, 0.3)' : 'rgba(255, 77, 79, 0.3)'}`,
        }}
      >
        {isAccepted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {verdict ? verdict.replace(/_/g, ' ') : ''}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Submission History
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>
            Inspect past submissions, evaluate runtime performance, and view code snapshots.
          </p>
        </div>

        {/* Verdict Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Verdicts' },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'WRONG_ANSWER', label: 'Wrong Answer' },
            { id: 'TIME_LIMIT_EXCEEDED', label: 'TLE' },
            { id: 'COMPILATION_ERROR', label: 'Compilation Error' },
          ].map((f) => {
            const isSel = verdictFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setVerdictFilter(f.id);
                  setPage(1);
                }}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: isSel ? 'var(--accent)' : 'var(--border)',
                  background: isSel ? 'var(--surface-2)' : 'transparent',
                  color: isSel ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--hard-bg)',
            border: '1px solid rgba(255, 77, 79, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            color: 'var(--hard)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={fetchSubmissions}>
            Retry
          </Button>
        </div>
      )}

      {/* Submissions Table Card */}
      <Card style={{ overflow: 'hidden', position: 'relative' }}>
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
                <th style={{ padding: '12px 16px' }}>Problem</th>
                <th style={{ padding: '12px 16px', width: '170px' }}>Verdict</th>
                <th style={{ padding: '12px 16px', width: '110px' }}>Language</th>
                <th style={{ padding: '12px 16px', width: '120px' }}>Passed</th>
                <th style={{ padding: '12px 16px', width: '100px' }}>Runtime</th>
                <th style={{ padding: '12px 16px', width: '110px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px' }}><Skeleton width="180px" height="16px" /></td>
                    <td style={{ padding: '14px 16px' }}><Skeleton width="100px" height="20px" borderRadius="10px" /></td>
                    <td style={{ padding: '14px 16px' }}><Skeleton width="70px" height="16px" /></td>
                    <td style={{ padding: '14px 16px' }}><Skeleton width="50px" height="16px" /></td>
                    <td style={{ padding: '14px 16px' }}><Skeleton width="60px" height="16px" /></td>
                    <td style={{ padding: '14px 16px' }}><Skeleton width="60px" height="16px" /></td>
                  </tr>
                ))
              ) : paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px' }}>
                    <EmptyState
                      icon={<ListFilter size={26} />}
                      title="No submissions found"
                      description={
                        verdictFilter !== 'ALL'
                          ? 'No submissions match the selected verdict filter.'
                          : "You haven't submitted any code yet. Pick a problem and try your solution!"
                      }
                      action={
                        verdictFilter !== 'ALL' ? (
                          <Button variant="secondary" size="sm" onClick={() => setVerdictFilter('ALL')}>
                            Clear filter
                          </Button>
                        ) : (
                          <Link to="/problems">
                            <Button variant="primary" size="sm">Browse Problems</Button>
                          </Link>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    onClick={() => handleRowClick(sub)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: idx % 2 === 1 ? 'var(--surface-2)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = idx % 2 === 1 ? 'var(--surface-2)' : 'transparent')
                    }
                  >
                    {/* Problem */}
                    <td style={{ padding: '14px 16px' }}>
                      <Link
                        to={`/problems/${sub.problemSlug}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontWeight: 600,
                          color: 'var(--text)',
                          textDecoration: 'none',
                        }}
                      >
                        {sub.problemTitle}
                      </Link>
                    </td>

                    {/* Verdict */}
                    <td style={{ padding: '14px 16px' }}>
                      {getVerdictBadge(sub.status)}
                    </td>

                    {/* Language */}
                    <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.8125rem' }}>
                      <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                        {sub.language}
                      </span>
                    </td>

                    {/* Passed / Total */}
                    <td style={{ padding: '14px 16px', color: 'var(--text)', fontSize: '0.8125rem' }}>
                      <strong>{sub.passedCount}</strong> / {sub.totalCount}
                    </td>

                    {/* Runtime */}
                    <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.8125rem' }}>
                      {sub.runtimeMs != null ? `${sub.runtimeMs} ms` : '-'}
                    </td>

                    {/* Relative Time */}
                    <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '0.8125rem' }}>
                      {formatRelativeTime(sub.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
            }}
          >
            <span style={{ color: 'var(--muted)' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({filteredSubmissions.length} total)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                iconLeft={<ChevronLeft size={14} />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                iconRight={<ChevronRight size={14} />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Code Drawer Overlay Modal */}
      {selectedSub && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 150ms ease-out',
          }}
          onClick={() => setSelectedSub(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              height: '100%',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                height: '60px',
                padding: '0 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                    Submission #{selectedSub.id}
                  </h3>
                  {getVerdictBadge(selectedSub.status)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>
                  {selectedSub.problemTitle} &bull; {selectedSub.language} &bull; {selectedSub.runtimeMs != null ? `${selectedSub.runtimeMs} ms` : '-'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCode}
                  iconLeft={copied ? <Check size={14} style={{ color: 'var(--easy)' }} /> : <Copy size={14} />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Code Body in Monaco Editor */}
            <div style={{ flexGrow: 1, padding: 0 }}>
              {loadingCode ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                  Loading submission code...
                </div>
              ) : (
                <Editor
                  height="100%"
                  language={selectedSub.language === 'JAVASCRIPT' ? 'javascript' : 'java'}
                  value={selectedSub.sourceCode || ''}
                  theme={isDark ? 'vs-dark' : 'vs'}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'var(--font-mono)',
                    automaticLayout: true,
                  }}
                />
              )}
            </div>

            {/* Error Output if present */}
            {selectedSub.errorText && (
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--hard-bg)',
                  borderTop: '1px solid rgba(255, 77, 79, 0.3)',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hard)', marginBottom: '4px' }}>
                  Error Output:
                </div>
                <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--hard)' }}>
                  <code>{selectedSub.errorText}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
