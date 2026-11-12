package com.codearena.backend.judge;

import com.codearena.backend.dto.SampleCaseResult;
import com.codearena.backend.model.SubmissionStatus;

import java.util.List;

public record SampleRunResult(
        SubmissionStatus verdict,
        long runtimeMs,
        String errorText,
        List<SampleCaseResult> cases
) {
}
