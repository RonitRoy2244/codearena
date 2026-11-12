package com.codearena.backend.dto;

import com.codearena.backend.model.SubmissionStatus;

import java.time.LocalDateTime;

public class SubmitResponse {

    private Long id;
    private SubmissionStatus verdict;
    private int passedCount;
    private int totalCount;
    private Long runtimeMs;
    private String errorText;
    private LocalDateTime createdAt;

    public SubmitResponse() {
    }

    public SubmitResponse(Long id, SubmissionStatus verdict, int passedCount, int totalCount, Long runtimeMs, String errorText, LocalDateTime createdAt) {
        this.id = id;
        this.verdict = verdict;
        this.passedCount = passedCount;
        this.totalCount = totalCount;
        this.runtimeMs = runtimeMs;
        this.errorText = errorText;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SubmissionStatus getVerdict() {
        return verdict;
    }

    public void setVerdict(SubmissionStatus verdict) {
        this.verdict = verdict;
    }

    public int getPassedCount() {
        return passedCount;
    }

    public void setPassedCount(int passedCount) {
        this.passedCount = passedCount;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
