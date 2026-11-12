package com.codearena.backend.service;

import com.codearena.backend.dto.RunCodeRequest;
import com.codearena.backend.dto.RunCodeResponse;
import com.codearena.backend.dto.SubmissionDetailResponse;
import com.codearena.backend.dto.SubmissionSummaryResponse;
import com.codearena.backend.dto.SubmitRequest;
import com.codearena.backend.dto.SubmitResponse;
import com.codearena.backend.exception.ForbiddenException;
import com.codearena.backend.exception.ResourceNotFoundException;
import com.codearena.backend.exception.TooManyRequestsException;
import com.codearena.backend.judge.JudgeResult;
import com.codearena.backend.judge.JudgeService;
import com.codearena.backend.judge.SampleRunResult;
import com.codearena.backend.model.Problem;
import com.codearena.backend.model.Submission;
import com.codearena.backend.model.TestCase;
import com.codearena.backend.model.User;
import com.codearena.backend.repository.ProblemRepository;
import com.codearena.backend.repository.SubmissionRepository;
import com.codearena.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    private final JudgeService judgeService;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;

    private final Map<Long, Long> lastSubmissionTimes = new ConcurrentHashMap<>();

    public SubmissionService(JudgeService judgeService,
                             ProblemRepository problemRepository,
                             UserRepository userRepository,
                             SubmissionRepository submissionRepository) {
        this.judgeService = judgeService;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
    }

    public RunCodeResponse runCode(String username, RunCodeRequest request) {
        // Authenticated user exists
        userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Problem problem = problemRepository.findBySlug(request.getProblemSlug())
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with slug: " + request.getProblemSlug()));

        List<TestCase> sampleCases = problem.getTestCases().stream()
                .filter(TestCase::isSample)
                .collect(Collectors.toList());

        SampleRunResult result = judgeService.runSamples(
                request.getLanguage(),
                request.getSourceCode(),
                problem.getTimeLimitMs(),
                sampleCases
        );

        return new RunCodeResponse(
                result.verdict(),
                result.runtimeMs(),
                result.errorText(),
                result.cases()
        );
    }

    @Transactional
    public SubmitResponse submit(String username, SubmitRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        checkSubmissionRateLimit(user.getId());

        Problem problem = problemRepository.findBySlug(request.getProblemSlug())
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with slug: " + request.getProblemSlug()));

        List<TestCase> allCases = problem.getTestCases();

        JudgeResult result = judgeService.judge(
                request.getLanguage(),
                request.getSourceCode(),
                problem.getTimeLimitMs(),
                allCases
        );

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setLanguage(request.getLanguage());
        submission.setSourceCode(request.getSourceCode());
        submission.setStatus(result.verdict());
        submission.setPassedCount(result.passedCount());
        submission.setTotalCount(result.totalCount());
        submission.setRuntimeMs(result.runtimeMs());
        submission.setErrorText(result.errorText());

        Submission saved = submissionRepository.save(submission);

        return new SubmitResponse(
                saved.getId(),
                saved.getStatus(),
                saved.getPassedCount(),
                saved.getTotalCount(),
                saved.getRuntimeMs(),
                saved.getErrorText(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<SubmissionSummaryResponse> getMySubmissions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return submissionRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(sub -> new SubmissionSummaryResponse(
                        sub.getId(),
                        sub.getProblem().getTitle(),
                        sub.getProblem().getSlug(),
                        sub.getLanguage(),
                        sub.getStatus(),
                        sub.getPassedCount(),
                        sub.getTotalCount(),
                        sub.getRuntimeMs(),
                        sub.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionDetailResponse getSubmissionById(String username, Long submissionId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        if (!submission.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have access to this submission");
        }

        return new SubmissionDetailResponse(
                submission.getId(),
                submission.getProblem().getTitle(),
                submission.getProblem().getSlug(),
                submission.getLanguage(),
                submission.getSourceCode(),
                submission.getStatus(),
                submission.getPassedCount(),
                submission.getTotalCount(),
                submission.getRuntimeMs(),
                submission.getErrorText(),
                submission.getCreatedAt()
        );
    }

    private void checkSubmissionRateLimit(Long userId) {
        long now = System.currentTimeMillis();
        Long last = lastSubmissionTimes.get(userId);
        if (last != null && (now - last) < 5000) {
            throw new TooManyRequestsException("Submission rate limit exceeded. Please wait 5 seconds between submissions.");
        }
        lastSubmissionTimes.put(userId, now);
    }

    public void clearRateLimits() {
        lastSubmissionTimes.clear();
    }
}
