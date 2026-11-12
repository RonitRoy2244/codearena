package com.codearena.backend.controller;

import com.codearena.backend.dto.RunCodeRequest;
import com.codearena.backend.dto.RunCodeResponse;
import com.codearena.backend.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/run")
public class RunController {

    private final SubmissionService submissionService;

    public RunController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public ResponseEntity<RunCodeResponse> runCode(@Valid @RequestBody RunCodeRequest request, Authentication authentication) {
        RunCodeResponse response = submissionService.runCode(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }
}
