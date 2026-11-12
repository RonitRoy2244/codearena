package com.codearena.backend.dto;

import com.codearena.backend.model.Difficulty;

import java.util.List;

public class ProblemDetailResponse {

    private Long id;
    private String title;
    private String slug;
    private String description;
    private Difficulty difficulty;
    private Integer timeLimitMs;
    private List<SampleTestCaseResponse> sampleTestCases;

    public ProblemDetailResponse() {
    }

    public ProblemDetailResponse(Long id, String title, String slug, String description, Difficulty difficulty, Integer timeLimitMs, List<SampleTestCaseResponse> sampleTestCases) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.difficulty = difficulty;
        this.timeLimitMs = timeLimitMs;
        this.sampleTestCases = sampleTestCases;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<SampleTestCaseResponse> getSampleTestCases() {
        return sampleTestCases;
    }

    public void setSampleTestCases(List<SampleTestCaseResponse> sampleTestCases) {
        this.sampleTestCases = sampleTestCases;
    }
}
