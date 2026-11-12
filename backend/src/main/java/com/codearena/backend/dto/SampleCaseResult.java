package com.codearena.backend.dto;

import com.codearena.backend.model.SubmissionStatus;

public class SampleCaseResult {

    private String input;
    private String expected;
    private String actual;
    private SubmissionStatus status;

    public SampleCaseResult() {
    }

    public SampleCaseResult(String input, String expected, String actual, SubmissionStatus status) {
        this.input = input;
        this.expected = expected;
        this.actual = actual;
        this.status = status;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpected() {
        return expected;
    }

    public void setExpected(String expected) {
        this.expected = expected;
    }

    public String getActual() {
        return actual;
    }

    public void setActual(String actual) {
        this.actual = actual;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }
}
