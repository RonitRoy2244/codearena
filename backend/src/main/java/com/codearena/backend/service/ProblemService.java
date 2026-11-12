package com.codearena.backend.service;

import com.codearena.backend.dto.CreateProblemRequest;
import com.codearena.backend.dto.CreateTestCaseRequest;
import com.codearena.backend.dto.ProblemDetailResponse;
import com.codearena.backend.dto.ProblemSummaryResponse;
import com.codearena.backend.dto.SampleTestCaseResponse;
import com.codearena.backend.exception.ConflictException;
import com.codearena.backend.exception.ResourceNotFoundException;
import com.codearena.backend.model.Problem;
import com.codearena.backend.model.TestCase;
import com.codearena.backend.repository.ProblemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    @Transactional(readOnly = true)
    public List<ProblemSummaryResponse> getAllProblems() {
        return problemRepository.findAll().stream()
                .map(problem -> new ProblemSummaryResponse(
                        problem.getId(),
                        problem.getTitle(),
                        problem.getSlug(),
                        problem.getDifficulty()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProblemDetailResponse getProblemBySlug(String slug) {
        Problem problem = problemRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with slug: " + slug));

        List<SampleTestCaseResponse> sampleTestCases = problem.getTestCases().stream()
                .filter(TestCase::isSample)
                .map(tc -> new SampleTestCaseResponse(tc.getId(), tc.getInput(), tc.getExpectedOutput()))
                .collect(Collectors.toList());

        return new ProblemDetailResponse(
                problem.getId(),
                problem.getTitle(),
                problem.getSlug(),
                problem.getDescription(),
                problem.getDifficulty(),
                problem.getTimeLimitMs(),
                sampleTestCases
        );
    }

    @Transactional
    public ProblemDetailResponse createProblem(CreateProblemRequest request) {
        String slug = request.getSlug().trim().toLowerCase();

        if (problemRepository.existsBySlug(slug)) {
            throw new ConflictException("Problem with slug already exists: " + slug);
        }

        Problem problem = new Problem();
        problem.setTitle(request.getTitle().trim());
        problem.setSlug(slug);
        problem.setDescription(request.getDescription().trim());
        problem.setDifficulty(request.getDifficulty());
        problem.setTimeLimitMs(request.getTimeLimitMs() != null && request.getTimeLimitMs() > 0
                ? request.getTimeLimitMs()
                : 2000);

        if (request.getTestCases() != null) {
            for (CreateTestCaseRequest tcReq : request.getTestCases()) {
                TestCase testCase = new TestCase(
                        problem,
                        tcReq.getInput(),
                        tcReq.getExpectedOutput(),
                        tcReq.isSample()
                );
                problem.addTestCase(testCase);
            }
        }

        Problem savedProblem = problemRepository.save(problem);

        List<SampleTestCaseResponse> sampleTestCases = savedProblem.getTestCases().stream()
                .filter(TestCase::isSample)
                .map(tc -> new SampleTestCaseResponse(tc.getId(), tc.getInput(), tc.getExpectedOutput()))
                .collect(Collectors.toList());

        return new ProblemDetailResponse(
                savedProblem.getId(),
                savedProblem.getTitle(),
                savedProblem.getSlug(),
                savedProblem.getDescription(),
                savedProblem.getDifficulty(),
                savedProblem.getTimeLimitMs(),
                sampleTestCases
        );
    }
}
