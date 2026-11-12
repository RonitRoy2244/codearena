package com.codearena.backend.dto;

import com.codearena.backend.model.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateProblemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    private Integer timeLimitMs;

    @NotEmpty(message = "At least one testcase is required")
    private List<@Valid CreateTestCaseRequest> testCases;

    public CreateProblemRequest() {
    }

    public CreateProblemRequest(String title, String slug, String description, Difficulty difficulty, Integer timeLimitMs, List<CreateTestCaseRequest> testCases) {
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.difficulty = difficulty;
        this.timeLimitMs = timeLimitMs;
        this.testCases = testCases;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getTimeLimitMs() {
        return timeLimitMs;
    }

    public void setTimeLimitMs(Integer timeLimitMs) {
        this.timeLimitMs = timeLimitMs;
    }

    public List<CreateTestCaseRequest> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<CreateTestCaseRequest> testCases) {
        this.testCases = testCases;
    }
}
