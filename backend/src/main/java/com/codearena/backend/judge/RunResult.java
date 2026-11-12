package com.codearena.backend.judge;

public record RunResult(RunStatus status, String stdout, String stderr, long runtimeMs) {
}
