package com.codearena.backend.judge;

public interface CodeRunner {
    RunResult run(Language language, String sourceCode, String stdin, int timeLimitMs);
}
