package com.codearena.backend.dto;

import com.codearena.backend.judge.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RunCodeRequest {

    @NotBlank(message = "problemSlug is required")
    private String problemSlug;

    @NotNull(message = "language is required")
    private Language language;

    @NotBlank(message = "sourceCode cannot be blank")
    private String sourceCode;

    public RunCodeRequest() {
    }

    public RunCodeRequest(String problemSlug, Language language, String sourceCode) {
        this.problemSlug = problemSlug;
        this.language = language;
        this.sourceCode = sourceCode;
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
}
