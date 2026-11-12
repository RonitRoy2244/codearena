package com.codearena.backend.dto;

public class SampleTestCaseResponse {

    private Long id;
    private String input;
    private String expectedOutput;

    public SampleTestCaseResponse() {
    }

    public SampleTestCaseResponse(Long id, String input, String expectedOutput) {
        this.id = id;
        this.input = input;
        this.expectedOutput = expectedOutput;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
