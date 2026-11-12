package com.codearena.backend.dto;

import com.codearena.backend.judge.Language;
import com.codearena.backend.model.SubmissionStatus;

import java.time.LocalDateTime;

public class SubmissionDetailResponse {

    private Long id;
    private String problemTitle;
    private String problemSlug;
    private Language language;
    private String sourceCode;
    private SubmissionStatus status;
    private int passedCount;
    private int totalCount;
    private Long runtimeMs;
    private String errorText;
    private LocalDateTime createdAt;

    public SubmissionDetailResponse() {
    }

    public SubmissionDetailResponse(Long id, String problemTitle, String problemSlug, Language language,
                                    String sourceCode, SubmissionStatus status, int passedCount,
                                    int totalCount, Long runtimeMs, String errorText, LocalDateTime createdAt) {
        this.id = id;
        this.problemTitle = problemTitle;
        this.problemSlug = problemSlug;
        this.language = language;
        this.sourceCode = sourceCode;
        this.status = status;
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

    public String getProblemTitle() {
        return problemTitle;
    }

    public void setProblemTitle(String problemTitle) {
        this.problemTitle = problemTitle;
    }

    public String getProblemSlug() {
        return problemSlug;
    }

    public void setProblemSlug(String problemSlug) {
        this.problemSlug = problemSlug;
    }

    public Language getLanguage() {
        return language;
    }

    public void setLanguage(Language language) {
        this.language = language;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
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
