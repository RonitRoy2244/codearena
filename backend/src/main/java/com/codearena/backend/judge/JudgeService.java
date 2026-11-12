package com.codearena.backend.judge;

import com.codearena.backend.dto.SampleCaseResult;
import com.codearena.backend.model.SubmissionStatus;
import com.codearena.backend.model.TestCase;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Semaphore;

@Service
public class JudgeService {

    private final CodeRunner codeRunner;
    private final Semaphore semaphore = new Semaphore(3, true);

    public JudgeService(CodeRunner codeRunner) {
        this.codeRunner = codeRunner;
    }

    public JudgeResult judge(Language language, String sourceCode, int baseTimeLimitMs, List<TestCase> testCases) {
        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Thread interrupted while waiting for judging permit", e);
        }

        try {
            int timeout = (language == Language.JAVA) ? baseTimeLimitMs * 3 : baseTimeLimitMs;
            int passedCount = 0;
            int totalCount = testCases.size();
            SubmissionStatus verdict = SubmissionStatus.ACCEPTED;
            String errorText = null;
            long maxRuntimeMs = 0;

            for (TestCase testCase : testCases) {
                RunResult rr = codeRunner.run(language, sourceCode, testCase.getInput(), timeout);
                maxRuntimeMs = Math.max(maxRuntimeMs, rr.runtimeMs());

                if (rr.status() == RunStatus.OK) {
                    String actual = normalize(rr.stdout());
                    String expected = normalize(testCase.getExpectedOutput());
                    if (actual.equals(expected)) {
                        passedCount++;
                    } else {
                        verdict = SubmissionStatus.WRONG_ANSWER;
                        break;
                    }
                } else if (rr.status() == RunStatus.TIME_LIMIT_EXCEEDED) {
                    verdict = SubmissionStatus.TIME_LIMIT_EXCEEDED;
                    errorText = "Time Limit Exceeded";
                    break;
                } else if (rr.status() == RunStatus.COMPILATION_ERROR) {
                    verdict = SubmissionStatus.COMPILATION_ERROR;
                    errorText = rr.stderr();
                    break;
                } else {
                    verdict = SubmissionStatus.RUNTIME_ERROR;
                    errorText = rr.stderr();
                    break;
                }
            }

            return new JudgeResult(verdict, passedCount, totalCount, maxRuntimeMs, errorText);

        } finally {
            semaphore.release();
        }
    }

    public SampleRunResult runSamples(Language language, String sourceCode, int baseTimeLimitMs, List<TestCase> sampleCases) {
        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Thread interrupted while waiting for judging permit", e);
        }

        try {
            int timeout = (language == Language.JAVA) ? baseTimeLimitMs * 3 : baseTimeLimitMs;
            List<SampleCaseResult> caseResults = new ArrayList<>();
            SubmissionStatus overallVerdict = SubmissionStatus.ACCEPTED;
            String overallErrorText = null;
            long maxRuntimeMs = 0;

            for (TestCase sampleCase : sampleCases) {
                RunResult rr = codeRunner.run(language, sourceCode, sampleCase.getInput(), timeout);
                maxRuntimeMs = Math.max(maxRuntimeMs, rr.runtimeMs());

                SubmissionStatus caseStatus;
                String actual = rr.stdout();

                if (rr.status() == RunStatus.OK) {
                    if (normalize(actual).equals(normalize(sampleCase.getExpectedOutput()))) {
                        caseStatus = SubmissionStatus.ACCEPTED;
                    } else {
                        caseStatus = SubmissionStatus.WRONG_ANSWER;
                    }
                } else if (rr.status() == RunStatus.TIME_LIMIT_EXCEEDED) {
                    caseStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
                    if (overallErrorText == null) {
                        overallErrorText = "Time Limit Exceeded";
                    }
                } else if (rr.status() == RunStatus.COMPILATION_ERROR) {
                    caseStatus = SubmissionStatus.COMPILATION_ERROR;
                    if (overallErrorText == null) {
                        overallErrorText = rr.stderr();
                    }
                } else {
                    caseStatus = SubmissionStatus.RUNTIME_ERROR;
                    if (overallErrorText == null) {
                        overallErrorText = rr.stderr();
                    }
                }

                caseResults.add(new SampleCaseResult(
                        sampleCase.getInput(),
                        sampleCase.getExpectedOutput(),
                        actual,
                        caseStatus
                ));

                if (overallVerdict == SubmissionStatus.ACCEPTED && caseStatus != SubmissionStatus.ACCEPTED) {
                    overallVerdict = caseStatus;
                }

                if (caseStatus == SubmissionStatus.COMPILATION_ERROR) {
                    break;
                }
            }

            return new SampleRunResult(overallVerdict, maxRuntimeMs, overallErrorText, caseResults);

        } finally {
            semaphore.release();
        }
    }

    public static String normalize(String s) {
        if (s == null) {
            return "";
        }
        String normalized = s.replace("\r\n", "\n").replace("\r", "\n");
        return normalized.stripTrailing();
    }
}
