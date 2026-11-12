package com.codearena.backend.judge;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "judge.runner", havingValue = "docker")
public class DockerRunner implements CodeRunner {

    // TODO: Implement DockerRunner for isolated container execution

    @Override
    public RunResult run(Language language, String sourceCode, String stdin, int timeLimitMs) {
        throw new UnsupportedOperationException("DockerRunner is not yet implemented");
    }
}
