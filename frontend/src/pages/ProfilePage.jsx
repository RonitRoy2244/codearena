import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Trophy,
  Activity,
  Calendar,
  ArrowRight,
  ListFilter,
  Zap,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Skeleton, EmptyState } from '../components/ui/Skeleton';

export default function ProfilePage() {
  const { username, role } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `${username || 'User'} | CodeArena Profile`;
  }, [username]);

  useEffect(() => {
    setLoading(true);
    api.get('/api/submissions/me')
      .then((res) => {
        setSubmissions(res.data || []);
      })
      .catch(() => {
        setSubmissions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute stats from real submissions
  const stats = useMemo(() => {
    const total = submissions.length;
    const acceptedSubs = submissions.filter((s) => s.status === 'ACCEPTED');
    const acceptedCount = acceptedSubs.length;
    const rate = total > 0 ? ((acceptedCount / total) * 100).toFixed(1) : '0.0';

    const uniqueSolved = new Set(acceptedSubs.map((s) => s.problemSlug)).size;

    // Earliest submission as joined date fallback
    const timestamps = submissions
      .map((s) => (s.createdAt ? new Date(s.createdAt).getTime() : null))
      .filter(Boolean)
      .sort((a, b) => a - b);

    const joinedDate = timestamps.length > 0
      ? new Date(timestamps[0]).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
      : 'Recently';

    return { total, acceptedCount, rate, uniqueSolved, joinedDate };
  }, [submissions]);

  // Compute 12-Month GitHub-Style Activity Heatmap (Last 52 weeks = 364 days)
  const heatmapData = useMemo(() => {
    const countsByDate = {};
    submissions.forEach((s) => {
      if (!s.createdAt) return;
      const d = new Date(s.createdAt).toISOString().split('T')[0];
      countsByDate[d] = (countsByDate[d] || 0) + 1;
    });

    const days = [];
    const today = new Date();
    // 52 weeks = 364 days
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({
        date: key,
        count: countsByDate[key] || 0,
      });
    }
    return days;
  }, [submissions]);

  const userInitial = (username || 'U').charAt(0).toUpperCase();

  const getHeatmapColor = (count) => {
    if (count === 0) return 'var(--surface-2)';
    if (count === 1) return 'rgba(44, 187, 93, 0.4)';
    if (count <= 3) return 'rgba(44, 187, 93, 0.7)';
    return 'var(--easy)';
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px', width: '100%' }}>
      {/* 1. Header Card */}
      <Card style={{ padding: '32px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar Circle */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              fontSize: '2.4rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--glow)',
              flexShrink: 0,
            }}
          >
            {userInitial}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                {username}
              </h1>
              {role === 'ADMIN' && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 77, 79, 0.15)',
                    color: 'var(--hard)',
                    border: '1px solid rgba(255, 77, 79, 0.3)',
                  }}
                >
                  ADMIN
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', color: 'var(--muted)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Active since {stats.joinedDate}
              </span>
              <span>&bull;</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} style={{ color: 'var(--accent)' }} /> {stats.total} total attempts
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <Card hover style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Problems Solved</span>
            <Trophy size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>
            {loading ? <Skeleton width="60px" height="32px" /> : stats.uniqueSolved}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
            Unique challenges completed
          </div>
        </Card>

        <Card hover style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Accepted Submissions</span>
            <CheckCircle2 size={18} style={{ color: 'var(--easy)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--easy)' }}>
            {loading ? <Skeleton width="60px" height="32px" /> : stats.acceptedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
            Passed all test cases
          </div>
        </Card>

        <Card hover style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Acceptance Rate</span>
            <Zap size={18} style={{ color: 'var(--accent-2)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-2)' }}>
            {loading ? <Skeleton width="60px" height="32px" /> : `${stats.rate}%`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
            Accuracy across all runs
          </div>
        </Card>

        <Card hover style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>Total Submissions</span>
            <ListFilter size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>
            {loading ? <Skeleton width="60px" height="32px" /> : stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
            Full judging submissions
          </div>
        </Card>
      </div>

      {/* 3. 12-Month GitHub-Style Activity Heatmap */}
      <Card style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text)' }}>
              Submission Activity
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: 0 }}>
              Activity over the last 12 months (52 weeks)
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--muted)' }}>
            <span>Less</span>
            <span style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'var(--surface-2)' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'rgba(44, 187, 93, 0.4)' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'rgba(44, 187, 93, 0.7)' }} />
            <span style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'var(--easy)' }} />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="table-responsive" style={{ paddingBottom: '8px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 12px)',
              gridAutoFlow: 'column',
              gap: '4px',
              width: 'max-content',
            }}
          >
            {heatmapData.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} submission${d.count === 1 ? '' : 's'}`}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: getHeatmapColor(d.count),
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* 4. Recent Submissions Section */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            Recent Activity
          </h3>
          <Link to="/submissions" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={14} />}>
              View all
            </Button>
          </Link>
        </div>

        {loading ? (
          <Skeleton height="80px" />
        ) : submissions.length === 0 ? (
          <EmptyState
            title="No activity recorded"
            description="Start solving problems to build your profile stats."
            action={
              <Link to="/problems">
                <Button variant="primary" size="sm">Explore Problems</Button>
              </Link>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {submissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <Link
                    to={`/problems/${sub.problemSlug}`}
                    style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}
                  >
                    {sub.problemTitle}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>
                    {sub.language} &bull; {sub.runtimeMs != null ? `${sub.runtimeMs} ms` : '-'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: sub.status === 'ACCEPTED' ? 'var(--easy)' : 'var(--hard)',
                    }}
                  >
                    {sub.status.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
