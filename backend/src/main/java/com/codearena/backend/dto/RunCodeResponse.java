package com.codearena.backend.dto;

import com.codearena.backend.model.SubmissionStatus;

import java.util.List;

public class RunCodeResponse {

    private SubmissionStatus verdict;
    private Long runtimeMs;
    private String errorText;
    private List<SampleCaseResult> cases;

    public RunCodeResponse() {
    }

    public RunCodeResponse(SubmissionStatus verdict, Long runtimeMs, String errorText, List<SampleCaseResult> cases) {
        this.verdict = verdict;
        this.runtimeMs = runtimeMs;
        this.errorText = errorText;
        this.cases = cases;
    }

    public SubmissionStatus getVerdict() {
        return verdict;
    }

    public void setVerdict(SubmissionStatus verdict) {
        this.verdict = verdict;
    }

    public Long getRuntimeMs() {
        return runtimeMs;
    }

    public void setRuntimeMs(Long runtimeMs) {
        this.runtimeMs = runtimeMs;
    }

    public String getErrorText() {
        return errorText;
    }

    public void setErrorText(String errorText) {
        this.errorText = errorText;
    }

    public List<SampleCaseResult> getCases() {
        return cases;
    }

    public void setCases(List<SampleCaseResult> cases) {
        this.cases = cases;
    }
}
