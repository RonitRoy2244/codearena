package com.codearena.backend.controller;

import com.codearena.backend.dto.SubmissionDetailResponse;
import com.codearena.backend.dto.SubmissionSummaryResponse;
import com.codearena.backend.dto.SubmitRequest;
import com.codearena.backend.dto.SubmitResponse;
import com.codearena.backend.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public ResponseEntity<SubmitResponse> submit(@Valid @RequestBody SubmitRequest request, Authentication authentication) {
        SubmitResponse response = submissionService.submit(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<SubmissionSummaryResponse>> getMySubmissions(Authentication authentication) {
        List<SubmissionSummaryResponse> response = submissionService.getMySubmissions(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionById(@PathVariable Long id, Authentication authentication) {
        SubmissionDetailResponse response = submissionService.getSubmissionById(authentication.getName(), id);
        return ResponseEntity.ok(response);
    }
}
