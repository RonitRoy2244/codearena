import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const STARTER_CODES = {
  JAVASCRIPT: `const fs = require('fs');
const input = require('fs').readFileSync(0, 'utf8');

// Write your solution here:
console.log(input.trim());
`,
  JAVA: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here:
        if (scanner.hasNextLine()) {
            System.out.println(scanner.nextLine());
        }
    }
}
`,
};

export default function ProblemDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedLanguage, setSelectedLanguage] = useState('JAVASCRIPT');
  const [codeByLanguage, setCodeByLanguage] = useState(STARTER_CODES);

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionType, setExecutionType] = useState(null); // 'run' | 'submit' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/api/problems/${slug}`)
      .then((res) => {
        setProblem(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load problem details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleCodeChange = (value) => {
    setCodeByLanguage((prev) => ({
      ...prev,
      [selectedLanguage]: value ?? '',
    }));
  };

  const handleRun = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsExecuting(true);
    setExecutionType('run');
    setErrorMessage('');
    setResult(null);

    try {
      const res = await api.post('/api/run', {
        problemSlug: slug,
        language: selectedLanguage,
        sourceCode: codeByLanguage[selectedLanguage],
      });
      setResult({ type: 'run', ...res.data });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 429) {
        setErrorMessage('Please wait a few seconds');
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to run code.');
      }
    } finally {
      setIsExecuting(false);
      setExecutionType(null);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsExecuting(true);
    setExecutionType('submit');
    setErrorMessage('');
    setResult(null);

    try {
      const res = await api.post('/api/submissions', {
        problemSlug: slug,
        language: selectedLanguage,
        sourceCode: codeByLanguage[selectedLanguage],
      });
      setResult({ type: 'submit', ...res.data });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 429) {
        setErrorMessage('Please wait a few seconds');
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to submit code.');
      }
    } finally {
      setIsExecuting(false);
      setExecutionType(null);
    }
  };

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

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading problem...</span>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Problem not found.'}
        </div>
        <Link to="/problems" className="btn btn-outline-primary">
          &larr; Back to Problems
        </Link>
      </div>
    );
  }

  const monacoLanguage = selectedLanguage === 'JAVASCRIPT' ? 'javascript' : 'java';

  const passedCount = result
    ? result.type === 'run'
      ? (result.cases?.filter((c) => c.status === 'ACCEPTED').length ?? 0)
      : result.passedCount
    : 0;

  const totalCount = result
    ? result.type === 'run'
      ? (result.cases?.length ?? 0)
      : result.totalCount
    : 0;

  return (
    <div className="container-fluid px-4 py-4">
      <div className="mb-3">
        <Link to="/problems" className="text-decoration-none text-muted small">
          &larr; All Problems
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Column: Problem Details & Sample Cases */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <h3 className="fw-bold mb-0">{problem.title}</h3>
                {getDifficultyBadge(problem.difficulty)}
              </div>

              {problem.timeLimitMs && (
                <div className="text-muted small mb-3">
                  Time Limit: <strong>{problem.timeLimitMs} ms</strong>
                </div>
              )}

              <div className="mb-4">
                <h5 className="fw-semibold">Description</h5>
                <div
                  className="text-secondary"
                  style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                >
                  {problem.description}
                </div>
              </div>

              {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                <div>
                  <h5 className="fw-semibold mb-3">Sample Test Cases</h5>
                  {problem.sampleTestCases.map((tc, index) => (
                    <div key={tc.id || index} className="card bg-light border-0 mb-3">
                      <div className="card-body p-3">
                        <div className="fw-semibold text-secondary small mb-2">
                          Example {index + 1}
                        </div>
                        <div className="mb-2">
                          <div className="text-muted small fw-semibold">Input:</div>
                          <pre className="bg-white p-2 rounded border mb-0 small font-monospace">
                            <code>{tc.input}</code>
                          </pre>
                        </div>
                        <div>
                          <div className="text-muted small fw-semibold">Expected Output:</div>
                          <pre className="bg-white p-2 rounded border mb-0 small font-monospace">
                            <code>{tc.expectedOutput}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Language selector, Monaco Editor, Run & Submit, Results */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 d-flex flex-column">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <span className="fw-semibold">Code Editor</span>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="languageSelect" className="small text-muted mb-0">
                  Language:
                </label>
                <select
                  id="languageSelect"
                  className="form-select form-select-sm"
                  style={{ width: '150px' }}
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  disabled={isExecuting}
                >
                  <option value="JAVASCRIPT">JavaScript</option>
                  <option value="JAVA">Java</option>
                </select>
              </div>
            </div>

            <div className="card-body p-0" style={{ minHeight: '60vh' }}>
              <Editor
                height="60vh"
                language={monacoLanguage}
                value={codeByLanguage[selectedLanguage]}
                theme="vs-dark"
                onChange={handleCodeChange}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: selectedLanguage === 'JAVA' ? 4 : 2,
                }}
              />
            </div>

            <div className="card-footer bg-white border-top py-3 d-flex justify-content-end align-items-center gap-2">
              <button
                className="btn btn-outline-secondary px-3 d-flex align-items-center gap-2"
                onClick={handleRun}
                disabled={isExecuting}
              >
                {isExecuting && executionType === 'run' && (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                )}
                Run
              </button>
              <button
                className="btn btn-success px-4 d-flex align-items-center gap-2"
                onClick={handleSubmit}
                disabled={isExecuting}
              >
                {isExecuting && executionType === 'submit' && (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                )}
                Submit
              </button>
            </div>
          </div>

          {/* Friendly 429 or other error message alert */}
          {errorMessage && (
            <div className="alert alert-warning mt-3 d-flex align-items-center justify-content-between" role="alert">
              <div>
                <strong>{errorMessage === 'Please wait a few seconds' ? 'Rate Limit: ' : 'Notice: '}</strong>
                {errorMessage}
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setErrorMessage('')}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Execution in progress spinner card */}
          {isExecuting && (
            <div className="card shadow-sm border-0 mt-3">
              <div className="card-body p-4 text-center text-muted">
                <div className="spinner-border text-primary me-2" role="status">
                  <span className="visually-hidden">Executing...</span>
                </div>
                <span>
                  {executionType === 'run'
                    ? 'Running code on sample test cases...'
                    : 'Submitting solution and judging test cases...'}
                </span>
              </div>
            </div>
          )}

          {/* Result Panel */}
          {result && !isExecuting && (
            <div className="card shadow-sm border-0 mt-3">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  {result.type === 'run' ? 'Run Result' : 'Submission Result'}
                </h5>
                <span
                  className={`fw-bold fs-6 ${
                    result.verdict === 'ACCEPTED' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {result.verdict}
                </span>
              </div>
              <div className="card-body p-4">
                <div className="d-flex flex-wrap gap-4 mb-3 pb-3 border-bottom">
                  <div>
                    <span className="text-muted small d-block">Verdict</span>
                    <span
                      className={`fw-bold fs-5 ${
                        result.verdict === 'ACCEPTED' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {result.verdict}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted small d-block">Passed</span>
                    <span className="fw-bold fs-5 text-dark">
                      {passedCount} / {totalCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted small d-block">Runtime</span>
                    <span className="fw-bold fs-5 text-dark">
                      {result.runtimeMs != null ? `${result.runtimeMs} ms` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Error text in monospace box if present */}
                {result.errorText && (
                  <div className="mb-3">
                    <span className="text-danger small fw-semibold d-block mb-1">
                      Error Output:
                    </span>
                    <pre
                      className="bg-dark text-danger p-3 rounded small font-monospace mb-0"
                      style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}
                    >
                      <code>{result.errorText}</code>
                    </pre>
                  </div>
                )}

                {/* For Run: Show each sample case with input, expected, and actual */}
                {result.type === 'run' && result.cases && result.cases.length > 0 && (
                  <div className="mt-3">
                    <h6 className="fw-semibold mb-3">Sample Cases Evaluation</h6>
                    <div className="d-flex flex-column gap-3">
                      {result.cases.map((c, idx) => (
                        <div key={idx} className="card border">
                          <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                            <span className="fw-semibold small">Case {idx + 1}</span>
                            <span
                              className={`badge ${
                                c.status === 'ACCEPTED' ? 'bg-success' : 'bg-danger'
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <div className="card-body p-3">
                            <div className="mb-2">
                              <span className="text-muted small fw-semibold d-block">Input:</span>
                              <pre className="bg-light p-2 rounded border mb-0 small font-monospace">
                                <code>{c.input}</code>
                              </pre>
                            </div>
                            <div className="mb-2">
                              <span className="text-muted small fw-semibold d-block">Expected:</span>
                              <pre className="bg-light p-2 rounded border mb-0 small font-monospace">
                                <code>{c.expected}</code>
                              </pre>
                            </div>
                            <div>
                              <span className="text-muted small fw-semibold d-block">Actual:</span>
                              <pre
                                className={`p-2 rounded border mb-0 small font-monospace ${
                                  c.status === 'ACCEPTED'
                                    ? 'bg-light'
                                    : 'bg-danger-subtle text-danger'
                                }`}
                              >
                                <code>{c.actual ?? ''}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
