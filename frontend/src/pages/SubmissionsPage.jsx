import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected submission detail for code viewer modal
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  const fetchSubmissions = () => {
    setLoading(true);
    setError('');
    api.get('/api/submissions/me')
      .then((res) => {
        setSubmissions(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load submissions.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedSubmissionId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRowClick = (sub) => {
    setSelectedSubmissionId(sub.id);
    setSelectedDetail(null);
    setDetailError('');
    setLoadingDetail(true);

    api.get(`/api/submissions/${sub.id}`)
      .then((res) => {
        setSelectedDetail(res.data);
      })
      .catch((err) => {
        setDetailError(err.response?.data?.message || 'Failed to load submission code.');
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  };

  const getVerdictBadge = (verdict) => {
    const isAccepted = verdict === 'ACCEPTED';
    const label = verdict ? verdict.replace(/_/g, ' ') : '';
    return (
      <span className={`badge ${isAccepted ? 'bg-success' : 'bg-danger'}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Submissions</h2>
          <p className="text-muted small mb-0">
            Click on any row to view your submitted code.
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="btn btn-outline-secondary btn-sm align-self-start align-self-sm-auto"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4" role="alert">
          <div>{error}</div>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchSubmissions}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading submissions...</span>
          </div>
          <div className="text-muted small mt-2">Loading your submissions...</div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-nowrap">
                <tr>
                  <th style={{ width: '70px' }}>#</th>
                  <th>Problem</th>
                  <th>Language</th>
                  <th>Verdict</th>
                  <th>Passed / Total</th>
                  <th>Runtime</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => handleRowClick(sub)}
                    style={{ cursor: 'pointer' }}
                    className={selectedSubmissionId === sub.id ? 'table-primary' : ''}
                  >
                    <td className="text-muted small">#{sub.id}</td>
                    <td className="fw-semibold">
                      <Link
                        to={`/problems/${sub.problemSlug}`}
                        className="text-decoration-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sub.problemTitle}
                      </Link>
                    </td>
                    <td className="text-nowrap">
                      <span className="badge bg-light text-dark border">
                        {sub.language}
                      </span>
                    </td>
                    <td className="text-nowrap">{getVerdictBadge(sub.status)}</td>
                    <td className="text-nowrap">
                      {sub.passedCount} / {sub.totalCount}
                    </td>
                    <td className="text-nowrap">
                      {sub.runtimeMs != null ? `${sub.runtimeMs} ms` : '-'}
                    </td>
                    <td className="text-muted small text-nowrap">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div className="mb-2">No submissions found yet.</div>
                      <Link to="/problems" className="btn btn-sm btn-primary">
                        Browse Problems
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Read-Only Monaco Code Viewer */}
      {selectedSubmissionId && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => setSelectedSubmissionId(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content shadow border-0">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    Submission #{selectedSubmissionId}
                    {selectedDetail?.problemTitle && ` — ${selectedDetail.problemTitle}`}
                  </h5>
                  {selectedDetail && (
                    <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                      {getVerdictBadge(selectedDetail.status)}
                      <span className="badge bg-secondary">{selectedDetail.language}</span>
                      <span className="badge bg-light text-dark border">
                        Passed: {selectedDetail.passedCount} / {selectedDetail.totalCount}
                      </span>
                      {selectedDetail.runtimeMs != null && (
                        <span className="badge bg-light text-dark border">
                          Runtime: {selectedDetail.runtimeMs} ms
                        </span>
                      )}
                      <span className="badge bg-light text-muted border">
                        {selectedDetail.createdAt ? new Date(selectedDetail.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSubmissionId(null)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-3">
                {loadingDetail ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading code...</span>
                    </div>
                    <div className="text-muted small mt-2">Loading submitted code...</div>
                  </div>
                ) : detailError ? (
                  <div className="alert alert-danger" role="alert">
                    {detailError}
                  </div>
                ) : selectedDetail ? (
                  <div>
                    <div className="border rounded overflow-hidden">
                      <Editor
                        height="45vh"
                        language={selectedDetail.language === 'JAVASCRIPT' ? 'javascript' : 'java'}
                        value={selectedDetail.sourceCode || ''}
                        theme="vs-dark"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>

                    {selectedDetail.errorText && (
                      <div className="mt-3">
                        <span className="text-danger small fw-semibold d-block mb-1">
                          Error Output:
                        </span>
                        <pre
                          className="bg-dark text-danger p-3 rounded small font-monospace mb-0"
                          style={{ whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto' }}
                        >
                          <code>{selectedDetail.errorText}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="modal-footer d-flex justify-content-between">
                {selectedDetail?.problemSlug ? (
                  <Link
                    to={`/problems/${selectedDetail.problemSlug}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Go to Problem
                  </Link>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedSubmissionId(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
