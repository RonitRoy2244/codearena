package com.codearena.backend.dto;

import jakarta.validation.constraints.NotNull;

public class CreateTestCaseRequest {

    @NotNull(message = "Input cannot be null")
    private String input;

    @NotNull(message = "Expected output cannot be null")
    private String expectedOutput;

    private boolean isSample;

    public CreateTestCaseRequest() {
    }

    public CreateTestCaseRequest(String input, String expectedOutput, boolean isSample) {
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.isSample = isSample;
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
