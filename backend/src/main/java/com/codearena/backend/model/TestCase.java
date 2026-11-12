package com.codearena.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "test_cases")
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String input;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String expectedOutput;

    @Column(nullable = false)
    private boolean isSample;

    public TestCase() {
    }

    public TestCase(Long id, Problem problem, String input, String expectedOutput, boolean isSample) {
        this.id = id;
        this.problem = problem;
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.isSample = isSample;
    }

    public TestCase(Problem problem, String input, String expectedOutput, boolean isSample) {
        this.problem = problem;
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.isSample = isSample;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public boolean isSample() {
        return isSample;
    }

    public boolean getIsSample() {
        return isSample;
    }

    public void setSample(boolean sample) {
        isSample = sample;
    }

    public void setIsSample(boolean sample) {
        isSample = sample;
    }
}
