import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Group, Panel, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import {
  Play,
  Send,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  ListFilter,
  X,
  ChevronRight,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DifficultyPill } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Kbd, Skeleton } from '../components/ui/Skeleton';

const STARTER_CODES = {
  JAVASCRIPT: `const fs = require('fs');
const input = require('fs').readFileSync(0, 'utf8');

function solve() {
  // Write your solution here
  console.log(input.trim());
}

solve();
`,
  JAVA: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here
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
  const { isDark } = useTheme();

  // Problem State
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [problemError, setProblemError] = useState('');
  const [isSolved, setIsSolved] = useState(false);

  // Left Panel Tabs: 'description' | 'submissions'
  const [leftTab, setLeftTab] = useState('description');
  const [problemSubmissions, setProblemSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmissionCode, setSelectedSubmissionCode] = useState(null);

  // Editor State
  const [selectedLanguage, setSelectedLanguage] = useState('JAVASCRIPT');
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('codearena-font-size') || '14', 10);
  });

  // Stored code per problem & language
  const [codeByLanguage, setCodeByLanguage] = useState(() => {
    const saved = localStorage.getItem(`codearena-code-${slug}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return STARTER_CODES;
      }
    }
    return STARTER_CODES;
  });

  // Bottom Console Tabs: 'testcase' | 'custom' | 'result'
  const [consoleTab, setConsoleTab] = useState('testcase');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [isSaved, setIsSaved] = useState(true);

  // Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionType, setExecutionType] = useState(null); // 'run' | 'submit'
  const [runResult, setRunResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Mobile layout switch (below 900px): 'desc' | 'code'
  const [mobileTab, setMobileTab] = useState('desc');

  // Load saved code when slug changes
  useEffect(() => {
    const saved = localStorage.getItem(`codearena-code-${slug}`);
    if (saved) {
      try {
        setCodeByLanguage(JSON.parse(saved));
        return;
      } catch {
        // fallback
      }
    }
    setCodeByLanguage(STARTER_CODES);
  }, [slug]);

  // Fetch Problem Data
  useEffect(() => {
    setLoadingProblem(true);
    setProblemError('');

    api.get(`/api/problems/${slug}`)
      .then((res) => {
        setProblem(res.data);
        if (res.data?.sampleTestCases?.length) {
          setCustomInput(res.data.sampleTestCases[0].input || '');
        }
      })
      .catch((err) => {
        setProblemError(err.response?.data?.message || 'Failed to load problem.');
      })
      .finally(() => {
        setLoadingProblem(false);
      });
  }, [slug]);

  // Fetch Problem Submissions when authenticated
  const fetchSubmissions = async () => {
    if (!isAuthenticated) return;
    setLoadingSubmissions(true);
    try {
      const res = await api.get('/api/submissions/me');
      const filtered = (res.data || []).filter((s) => s.problemSlug === slug);
      setProblemSubmissions(filtered);
      const solved = filtered.some((s) => s.status === 'ACCEPTED');
      setIsSolved(solved);
    } catch {
      setProblemSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [slug, isAuthenticated]);

  // Save Code to LocalStorage
  const handleCodeChange = (value) => {
    setIsSaved(false);
    setCodeByLanguage((prev) => {
      const updated = { ...prev, [selectedLanguage]: value ?? '' };
      localStorage.setItem(`codearena-code-${slug}`, JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => setIsSaved(true), 350);
  };

  // Reset Code
  const handleResetCode = () => {
    if (window.confirm('Reset code to starter template?')) {
      setCodeByLanguage((prev) => {
        const updated = { ...prev, [selectedLanguage]: STARTER_CODES[selectedLanguage] };
        localStorage.setItem(`codearena-code-${slug}`, JSON.stringify(updated));
        return updated;
      });
      setIsSaved(true);
      toast('Code reset to default starter', { icon: '🔄' });
    }
  };

  // Font size change
  const handleFontSizeChange = (e) => {
    const size = parseInt(e.target.value, 10);
    setFontSize(size);
    localStorage.setItem('codearena-font-size', String(size));
  };

  // Define Custom Monaco Theme
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('codearena-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ffa116', fontStyle: 'bold' },
        { token: 'string', foreground: '2cbb5d' },
        { token: 'number', foreground: '7c5cff' },
        { token: 'identifier', foreground: 'e8ebf1' },
      ],
      colors: {
        'editor.background': '#11141b',
        'editor.foreground': '#e8ebf1',
        'editor.lineHighlightBackground': '#1c212c66',
        'editorCursor.foreground': '#ffa116',
        'editorWhitespace.foreground': '#2a303c',
        'editorIndentGuide.background': '#1e2430',
        'editorIndentGuide.activeBackground': '#3a4459',
        'editor.selectionBackground': '#7c5cff33',
      },
    });

    monaco.editor.defineTheme('codearena-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd97706', fontStyle: 'bold' },
        { token: 'string', foreground: '16a34a' },
        { token: 'number', foreground: '6d4aff' },
      ],
      colors: {
        'editor.background': '#f8fafc',
        'editor.foreground': '#171b23',
        'editor.lineHighlightBackground': '#edf0f5',
        'editorCursor.foreground': '#f59e0b',
        'editor.selectionBackground': '#7c5cff22',
      },
    });
  };

  // Execute Code: Run
  const handleRun = async (overrideCustom = null) => {
    if (!isAuthenticated) {
      toast('Please sign in to run code', { icon: '🔒' });
      navigate('/login');
      return;
    }

    setIsExecuting(true);
    setExecutionType('run');
    setConsoleTab('result');

    try {
      const payload = {
        problemSlug: slug,
        language: selectedLanguage,
        sourceCode: codeByLanguage[selectedLanguage],
      };

      const inputToUse = overrideCustom !== null 
        ? overrideCustom 
        : (consoleTab === 'custom' ? customInput : null);

      if (inputToUse !== null && inputToUse !== undefined) {
        payload.customInput = inputToUse;
      }

      const res = await api.post('/api/run', payload);
      setRunResult({ type: 'run', isCustom: payload.customInput != null, ...res.data });
      setSelectedCaseIdx(0);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 429) {
        toast.error('Slow down, try again in a few seconds');
      } else {
        toast.error(err.response?.data?.message || 'Execution error');
      }
    } finally {
      setIsExecuting(false);
      setExecutionType(null);
    }
  };

  // Execute Code: Submit
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast('Please sign in to submit your solution', { icon: '🔒' });
      navigate('/login');
      return;
    }

    setIsExecuting(true);
    setExecutionType('submit');
    setConsoleTab('result');

    try {
      const res = await api.post('/api/submissions', {
        problemSlug: slug,
        language: selectedLanguage,
        sourceCode: codeByLanguage[selectedLanguage],
      });

      const data = { type: 'submit', ...res.data };
      setRunResult(data);

      if (data.verdict === 'ACCEPTED') {
        setIsSolved(true);
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#2cbb5d', '#ffa116', '#7c5cff'],
          });
        }
        toast.success('Accepted! All test cases passed.');
      } else {
        toast.error(`Verdict: ${data.verdict.replace(/_/g, ' ')}`);
      }

      fetchSubmissions();
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 429) {
        toast.error('Slow down, try again in a few seconds');
      } else {
        toast.error(err.response?.data?.message || 'Submission error');
      }
    } finally {
      setIsExecuting(false);
      setExecutionType(null);
    }
  };

  // Global Keyboard Shortcuts: Ctrl+Enter (Run) & Ctrl+Shift+Enter (Submit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [codeByLanguage, selectedLanguage, isAuthenticated]);

  // Copy helper
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Loading / Error screen
  if (loadingProblem) {
    return (
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="ca-spin" style={{ display: 'inline-block', marginBottom: '16px', color: 'var(--accent)' }}>
            <RotateCcw size={28} />
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Loading problem environment...</div>
        </div>
      </div>
    );
  }

  if (problemError || !problem) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--hard)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>
          {problemError || 'Problem not found'}
        </div>
        <Link to="/problems">
          <Button variant="secondary" size="md">
            &larr; Back to Problems
          </Button>
        </Link>
      </div>
    );
  }

  const sampleCases = problem.sampleTestCases || [];
  const currentCase = sampleCases[selectedCaseIdx] || sampleCases[0] || null;

  return (
    <div
      style={{
        height: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* Mobile Top Segmented Switch (< 900px) */}
      <div
        className="d-flex d-md-none align-items-center justify-content-between px-3 py-2"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMobileTab('desc')}
            style={{
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: mobileTab === 'desc' ? 'var(--surface-2)' : 'transparent',
              color: mobileTab === 'desc' ? 'var(--accent)' : 'var(--muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('code')}
            style={{
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: mobileTab === 'code' ? 'var(--surface-2)' : 'transparent',
              color: mobileTab === 'code' ? 'var(--accent)' : 'var(--muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Code &amp; Console
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button variant="secondary" size="sm" onClick={handleRun} disabled={isExecuting}>
            Run
          </Button>
          <Button variant="success" size="sm" onClick={handleSubmit} disabled={isExecuting}>
            Submit
          </Button>
        </div>
      </div>

      {/* Main Resizable Workspace */}
      <div style={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        <Group orientation="horizontal" id="codearena-workspace-v1">
          {/* LEFT PANEL: Description & Submissions */}
          <Panel
            defaultSize="45%"
            minSize="25%"
            className={`workspace-panel ${mobileTab === 'code' ? 'd-none d-md-block' : ''}`}
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
            }}
          >
            {/* Left Header Tabs */}
            <div
              style={{
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                background: 'var(--surface-2)',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setLeftTab('description')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: leftTab === 'description' ? 'var(--text)' : 'var(--muted)',
                    background: leftTab === 'description' ? 'var(--surface)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={14} style={{ color: 'var(--accent)' }} />
                  <span>Description</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeftTab('submissions')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: leftTab === 'submissions' ? 'var(--text)' : 'var(--muted)',
                    background: leftTab === 'submissions' ? 'var(--surface)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  <ListFilter size={14} style={{ color: 'var(--accent-2)' }} />
                  <span>Submissions</span>
                  {problemSubmissions.length > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--surface-2)',
                        color: 'var(--accent)',
                      }}
                    >
                      {problemSubmissions.length}
                    </span>
                  )}
                </button>
              </div>

              {isSolved && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--easy)',
                    background: 'var(--easy-bg)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  <CheckCircle2 size={13} /> Solved
                </span>
              )}
            </div>

            {/* Left Content Area (Scrollable) */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              {leftTab === 'description' ? (
                <div>
                  {/* Title & Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                      {problem.title}
                    </h2>
                    <DifficultyPill difficulty={problem.difficulty} size="sm" />
                  </div>

                  {/* Time limit info */}
                  {problem.timeLimitMs && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} /> Time Limit: <strong>{problem.timeLimitMs} ms</strong>
                      <span style={{ color: 'var(--border)' }}>&bull;</span>
                      <span>Java 3x limit multiplier</span>
                    </div>
                  )}

                  {/* Markdown Problem Description */}
                  <div
                    className="ca-markdown"
                    style={{
                      color: 'var(--text)',
                      fontSize: '0.925rem',
                      lineHeight: 1.7,
                      marginBottom: '28px',
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {problem.description || ''}
                    </ReactMarkdown>
                  </div>

                  {/* Sample Test Cases (Example 1, Example 2) */}
                  {sampleCases.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
                        Examples
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {sampleCases.map((tc, idx) => (
                          <div
                            key={tc.id || idx}
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              padding: '16px',
                            }}
                          >
                            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '12px' }}>
                              Example {idx + 1}
                            </div>

                            {/* Input */}
                            <div style={{ marginBottom: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>Input:</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(tc.input, `in-${idx}`)}
                                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                                >
                                  {copiedKey === `in-${idx}` ? <Check size={12} style={{ color: 'var(--easy)' }} /> : <Copy size={12} />}
                                  {copiedKey === `in-${idx}` ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <pre
                                style={{
                                  margin: 0,
                                  padding: '8px 12px',
                                  background: 'var(--code-bg)',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border)',
                                  fontSize: '0.8rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--text)',
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                <code>{tc.input}</code>
                              </pre>
                            </div>

                            {/* Output */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>Output:</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(tc.expectedOutput, `out-${idx}`)}
                                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                                >
                                  {copiedKey === `out-${idx}` ? <Check size={12} style={{ color: 'var(--easy)' }} /> : <Copy size={12} />}
                                  {copiedKey === `out-${idx}` ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <pre
                                style={{
                                  margin: 0,
                                  padding: '8px 12px',
                                  background: 'var(--code-bg)',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border)',
                                  fontSize: '0.8rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--text)',
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                <code>{tc.expectedOutput}</code>
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Submissions Tab */
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text)' }}>
                    Your Submissions for {problem.title}
                  </h4>

                  {!isAuthenticated ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                      <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link> to view and inspect your past submissions.
                    </div>
                  ) : loadingSubmissions ? (
                    <div style={{ padding: '24px 0' }}>
                      <Skeleton height="36px" style={{ marginBottom: '8px' }} />
                      <Skeleton height="36px" style={{ marginBottom: '8px' }} />
                      <Skeleton height="36px" />
                    </div>
                  ) : problemSubmissions.length === 0 ? (
                    <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                      No submissions recorded yet for this problem. Try submitting your code!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {problemSubmissions.map((sub) => {
                        const isAcc = sub.status === 'ACCEPTED';
                        return (
                          <div
                            key={sub.id}
                            onClick={() => {
                              api.get(`/api/submissions/${sub.id}`).then((res) => {
                                setSelectedSubmissionCode(res.data);
                              });
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.8125rem',
                                    color: isAcc ? 'var(--easy)' : 'var(--hard)',
                                  }}
                                >
                                  {sub.status.replace(/_/g, ' ')}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                                  #{sub.id}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                {sub.language} &bull; {sub.runtimeMs != null ? `${sub.runtimeMs} ms` : '-'} &bull; {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--accent)' }}>
                              <span>View code</span>
                              <ChevronRight size={14} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Read-Only Submission Code Drawer */}
            {selectedSubmissionCode && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--surface)',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: selectedSubmissionCode.status === 'ACCEPTED' ? 'var(--easy)' : 'var(--hard)',
                      }}
                    >
                      Submission #{selectedSubmissionCode.id} &mdash; {selectedSubmissionCode.status.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      ({selectedSubmissionCode.runtimeMs} ms &bull; {selectedSubmissionCode.passedCount}/{selectedSubmissionCode.totalCount} passed)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard(selectedSubmissionCode.sourceCode, 'drawer-copy');
                        toast.success('Code copied to clipboard');
                      }}
                      iconLeft={<Copy size={13} />}
                    >
                      Copy
                    </Button>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmissionCode(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div style={{ flexGrow: 1, padding: 0 }}>
                  <Editor
                    height="100%"
                    language={selectedSubmissionCode.language === 'JAVASCRIPT' ? 'javascript' : 'java'}
                    value={selectedSubmissionCode.sourceCode || ''}
                    theme={isDark ? 'codearena-dark' : 'codearena-light'}
                    beforeMount={handleEditorWillMount}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            )}
          </Panel>

          <Separator style={{ width: '4px', background: 'var(--border)', cursor: 'col-resize' }} />

          {/* RIGHT PANEL: Editor (Top) & Console (Bottom) */}
          <Panel
            defaultSize="55%"
            minSize="30%"
            className={`workspace-panel ${mobileTab === 'desc' ? 'd-none d-md-block' : ''}`}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Group orientation="vertical" id="codearena-editor-console-v1">
              {/* TOP PANEL: Monaco Editor */}
              <Panel defaultSize="65%" minSize="30%" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
                {/* Editor Toolbar */}
                <div
                  style={{
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 14px',
                    background: 'var(--surface-2)',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                  }}
                >
                  {/* Language & Settings */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      style={{
                        height: '28px',
                        padding: '0 8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text)',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="JAVASCRIPT">JavaScript (Node 24)</option>
                      <option value="JAVA">Java (OpenJDK 17)</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleResetCode}
                      title="Reset code template"
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
                      <RotateCcw size={14} />
                    </button>

                    {/* Font Size Select */}
                    <select
                      value={fontSize}
                      onChange={handleFontSizeChange}
                      title="Editor font size"
                      style={{
                        height: '26px',
                        fontSize: '0.75rem',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="12">12px</option>
                      <option value="14">14px</option>
                      <option value="16">16px</option>
                      <option value="18">18px</option>
                    </select>

                    {/* Auto-save status indicator */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        color: 'var(--muted)',
                        userSelect: 'none',
                        marginLeft: '4px',
                      }}
                      title="Changes are auto-saved to your local draft in browser storage"
                    >
                      <Check size={12} style={{ color: isSaved ? 'var(--easy)' : 'var(--muted)' }} />
                      <span className="d-none d-sm-inline">{isSaved ? 'Saved' : 'Saving...'}</span>
                    </span>
                  </div>

                  {/* Run & Submit Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRun}
                      loading={isExecuting && executionType === 'run'}
                      disabled={isExecuting}
                      iconLeft={<Play size={13} fill="currentColor" />}
                    >
                      <span>Run</span>
                      <span className="d-none d-xl-inline ms-1"><Kbd>Ctrl↵</Kbd></span>
                    </Button>

                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleSubmit}
                      loading={isExecuting && executionType === 'submit'}
                      disabled={isExecuting}
                      iconLeft={<Send size={13} />}
                    >
                      <span>Submit</span>
                      <span className="d-none d-xl-inline ms-1"><Kbd>Ctrl⇧↵</Kbd></span>
                    </Button>
                  </div>
                </div>

                {/* Monaco Editor Container */}
                <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                  <Editor
                    height="100%"
                    language={selectedLanguage === 'JAVASCRIPT' ? 'javascript' : 'java'}
                    value={codeByLanguage[selectedLanguage]}
                    theme={isDark ? 'codearena-dark' : 'codearena-light'}
                    beforeMount={handleEditorWillMount}
                    onChange={handleCodeChange}
                    options={{
                      fontSize,
                      fontFamily: 'var(--font-mono)',
                      fontLigatures: true,
                      minimap: { enabled: false },
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                      bracketPairColorization: { enabled: true },
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      tabSize: selectedLanguage === 'JAVA' ? 4 : 2,
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </div>
              </Panel>

              <Separator style={{ height: '4px', background: 'var(--border)', cursor: 'row-resize' }} />

              {/* BOTTOM PANEL: Console (Testcase | Test Result) */}
              <Panel defaultSize="35%" minSize="15%" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
                {/* Console Tabs */}
                <div
                  style={{
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface)',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setConsoleTab('testcase')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: consoleTab === 'testcase' ? 'var(--text)' : 'var(--muted)',
                        background: consoleTab === 'testcase' ? 'var(--surface-2)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      Sample Cases
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleTab('custom')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: consoleTab === 'custom' ? 'var(--text)' : 'var(--muted)',
                        background: consoleTab === 'custom' ? 'var(--surface-2)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Custom Input</span>
                      {customInput && (
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                          }}
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleTab('result')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: consoleTab === 'result' ? 'var(--text)' : 'var(--muted)',
                        background: consoleTab === 'result' ? 'var(--surface-2)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Test Result</span>
                      {runResult && (
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: runResult.verdict === 'ACCEPTED' ? 'var(--easy)' : 'var(--hard)',
                          }}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Console Content Area */}
                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px 20px' }}>
                  {consoleTab === 'testcase' ? (
                    <div>
                      {/* Case Chips */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        {sampleCases.map((tc, idx) => (
                          <button
                            key={tc.id || idx}
                            type="button"
                            onClick={() => setSelectedCaseIdx(idx)}
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              borderRadius: 'var(--radius)',
                              border: '1px solid',
                              borderColor: selectedCaseIdx === idx ? 'var(--accent)' : 'var(--border)',
                              background: selectedCaseIdx === idx ? 'var(--surface)' : 'transparent',
                              color: selectedCaseIdx === idx ? 'var(--accent)' : 'var(--muted)',
                              cursor: 'pointer',
                            }}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Selected Case Input */}
                      {currentCase && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>
                              stdin input:
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomInput(currentCase.input);
                                setConsoleTab('custom');
                                toast('Loaded into Custom Input', { icon: '✏️' });
                              }}
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--accent)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              Edit as custom input →
                            </button>
                          </div>
                          <pre
                            style={{
                              margin: 0,
                              padding: '10px 14px',
                              background: 'var(--code-bg)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text)',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            <code>{currentCase.input}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : consoleTab === 'custom' ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>
                          Custom stdin input:
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (sampleCases[0]) {
                                setCustomInput(sampleCases[0].input);
                                toast('Loaded Sample 1 input', { icon: '📋' });
                              }
                            }}
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--accent)',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Load Sample 1
                          </button>
                          <span style={{ color: 'var(--border)' }}>|</span>
                          <button
                            type="button"
                            onClick={() => setCustomInput('')}
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--muted)',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Type or paste custom stdin input here..."
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'var(--code-bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text)',
                          resize: 'vertical',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRun(customInput)}
                          loading={isExecuting && executionType === 'run'}
                          disabled={isExecuting}
                          iconLeft={<Play size={13} fill="currentColor" />}
                        >
                          Run Custom Input
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Test Result Tab */
                    <div>
                      {isExecuting ? (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)' }}>
                          <div className="ca-spin" style={{ display: 'inline-block', marginBottom: '10px', color: 'var(--accent)' }}>
                            <RotateCcw size={22} />
                          </div>
                          <div style={{ fontSize: '0.875rem' }}>
                            {executionType === 'run' ? 'Running code...' : 'Submitting & judging all test cases...'}
                          </div>
                        </div>
                      ) : !runResult ? (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                          Run your code to evaluate against test cases or custom input.
                        </div>
                      ) : (
                        <div>
                          {/* Animated Verdict Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {runResult.verdict === 'ACCEPTED' ? (
                                <CheckCircle2 size={24} style={{ color: 'var(--easy)' }} />
                              ) : runResult.verdict === 'TIME_LIMIT_EXCEEDED' || runResult.verdict === 'COMPILATION_ERROR' ? (
                                <AlertTriangle size={24} style={{ color: 'var(--medium)' }} />
                              ) : (
                                <XCircle size={24} style={{ color: 'var(--hard)' }} />
                              )}
                              <span
                                style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 800,
                                  color:
                                    runResult.verdict === 'ACCEPTED'
                                      ? 'var(--easy)'
                                      : runResult.verdict === 'TIME_LIMIT_EXCEEDED' || runResult.verdict === 'COMPILATION_ERROR'
                                      ? 'var(--medium)'
                                      : 'var(--hard)',
                                }}
                              >
                                {runResult.isCustom ? (runResult.verdict === 'ACCEPTED' ? 'FINISHED' : runResult.verdict.replace(/_/g, ' ')) : runResult.verdict.replace(/_/g, ' ')}
                              </span>
                              {runResult.isCustom && (
                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                                  Custom Run
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8125rem' }}>
                              <span>Runtime: <strong style={{ color: 'var(--text)' }}>{runResult.runtimeMs != null ? `${runResult.runtimeMs} ms` : '-'}</strong></span>
                              {runResult.type === 'submit' && (
                                <span>Passed: <strong style={{ color: 'var(--text)' }}>{runResult.passedCount} / {runResult.totalCount}</strong></span>
                              )}
                            </div>
                          </div>

                          {/* Passed / Total Progress Bar (for Submit) */}
                          {runResult.type === 'submit' && (
                            <div
                              style={{
                                width: '100%',
                                height: '6px',
                                background: 'var(--surface)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                                marginBottom: '16px',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${(runResult.passedCount / (runResult.totalCount || 1)) * 100}%`,
                                  background: runResult.verdict === 'ACCEPTED' ? 'var(--easy)' : 'var(--hard)',
                                  borderRadius: 'var(--radius-full)',
                                  transition: 'width 0.4s ease',
                                }}
                              />
                            </div>
                          )}

                          {/* Error Text in Red-Tinted Box */}
                          {runResult.errorText && (
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--hard)', marginBottom: '4px' }}>
                                Error Output:
                              </div>
                              <pre
                                style={{
                                  margin: 0,
                                  padding: '12px',
                                  background: 'var(--hard-bg)',
                                  border: '1px solid rgba(255, 77, 79, 0.3)',
                                  borderRadius: 'var(--radius)',
                                  color: 'var(--hard)',
                                  fontSize: '0.8rem',
                                  fontFamily: 'var(--font-mono)',
                                  whiteSpace: 'pre-wrap',
                                  maxHeight: '180px',
                                  overflowY: 'auto',
                                }}
                              >
                                <code>{runResult.errorText}</code>
                              </pre>
                            </div>
                          )}

                          {/* For Run: Show sample case chips and input/expected/output with diff highlight */}
                          {runResult.type === 'run' && runResult.cases && runResult.cases.length > 0 && (
                            <div>
                              {!runResult.isCustom && (
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                  {runResult.cases.map((c, idx) => {
                                    const isCaseAcc = c.status === 'ACCEPTED';
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedCaseIdx(idx)}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '5px 12px',
                                          fontSize: '0.78rem',
                                          fontWeight: 600,
                                          borderRadius: 'var(--radius)',
                                          border: '1px solid',
                                          borderColor: selectedCaseIdx === idx ? 'var(--accent)' : 'var(--border)',
                                          background: selectedCaseIdx === idx ? 'var(--surface)' : 'transparent',
                                          color: selectedCaseIdx === idx ? 'var(--text)' : 'var(--muted)',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <span
                                          style={{
                                            width: '7px',
                                            height: '7px',
                                            borderRadius: '50%',
                                            background: isCaseAcc ? 'var(--easy)' : 'var(--hard)',
                                          }}
                                        />
                                        Case {idx + 1}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Selected Case Evaluation Details */}
                              {runResult.cases[selectedCaseIdx] && (
                                <div style={{ display: 'grid', gridTemplateColumns: runResult.isCustom ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                  {/* Input */}
                                  <div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                                      {runResult.isCustom ? 'Custom Input (stdin)' : 'Input'}
                                    </div>
                                    <pre style={{ margin: 0, padding: '8px 10px', background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                                      <code>{runResult.cases[selectedCaseIdx].input || '(empty)'}</code>
                                    </pre>
                                  </div>

                                  {/* Expected (only for sample cases) */}
                                  {!runResult.isCustom && (
                                    <div>
                                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>Expected</div>
                                      <pre style={{ margin: 0, padding: '8px 10px', background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                                        <code>{runResult.cases[selectedCaseIdx].expected}</code>
                                      </pre>
                                    </div>
                                  )}

                                  {/* Output */}
                                  <div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>Actual Output (stdout)</div>
                                    <pre
                                      style={{
                                        margin: 0,
                                        padding: '8px 10px',
                                        background: runResult.cases[selectedCaseIdx].status === 'ACCEPTED' ? 'var(--code-bg)' : 'var(--hard-bg)',
                                        border: `1px solid ${runResult.cases[selectedCaseIdx].status === 'ACCEPTED' ? 'var(--border)' : 'rgba(255, 77, 79, 0.4)'}`,
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.8rem',
                                        fontFamily: 'var(--font-mono)',
                                        color: runResult.cases[selectedCaseIdx].status === 'ACCEPTED' ? 'var(--text)' : 'var(--hard)',
                                      }}
                                    >
                                      <code>{runResult.cases[selectedCaseIdx].actual ?? '(no output)'}</code>
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      <style>{`
        .ca-markdown h1, .ca-markdown h2, .ca-markdown h3 {
          font-weight: 700;
          color: var(--text);
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .ca-markdown p {
          margin-bottom: 0.85rem;
        }
        .ca-markdown code {
          background: var(--surface-2);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 0.85em;
        }
        .ca-markdown pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .ca-markdown table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .ca-markdown th, .ca-markdown td {
          border: 1px solid var(--border);
          padding: 6px 10px;
        }
        .ca-markdown th {
          background: var(--surface-2);
        }
      `}</style>
    </div>
  );
}
