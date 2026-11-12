import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/problems')
      .then((res) => {
        setProblems(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load problems.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return <span className="badge bg-success">Easy</span>;
      case 'MEDIUM':
        return <span className="badge bg-warning text-dark">Medium</span>;
      case 'HARD':
        return <span className="badge bg-danger">Hard</span>;
      default:
        return <span className="badge bg-secondary">{difficulty}</span>;
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Coding Problems</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>#</th>
                  <th>Title</th>
                  <th style={{ width: '140px' }}>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p.id}>
                    <td className="text-muted">{p.id}</td>
                    <td className="fw-semibold">
                      <Link to={`/problems/${p.slug}`} className="text-decoration-none">
                        {p.title}
                      </Link>
                    </td>
                    <td>{getDifficultyBadge(p.difficulty)}</td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted">
                      No problems found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
