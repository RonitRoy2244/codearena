package com.codearena.backend.judge;

import com.codearena.backend.model.SubmissionStatus;

public record JudgeResult(
        SubmissionStatus verdict,
        int passedCount,
        int totalCount,
        long runtimeMs,
        String errorText
) {
}
