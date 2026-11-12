package com.codearena.backend.dto;

import com.codearena.backend.model.Difficulty;

public class ProblemSummaryResponse {

    private Long id;
    private String title;
    private String slug;
    private Difficulty difficulty;

    public ProblemSummaryResponse() {
    }

    public ProblemSummaryResponse(Long id, String title, String slug, Difficulty difficulty) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.difficulty = difficulty;
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

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }
}
