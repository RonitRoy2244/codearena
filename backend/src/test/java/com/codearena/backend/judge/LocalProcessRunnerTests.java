package com.codearena.backend.judge;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalProcessRunnerTests {

    private LocalProcessRunner runner;

    @BeforeEach
    void setUp() {
        runner = new LocalProcessRunner();
    }

    @Test
    void shouldRunJavaScriptMultiplication() {
        RunResult result = runner.run(Language.JAVASCRIPT, "console.log(21*2);", "", 2000);

        assertEquals(RunStatus.OK, result.status());
        assertEquals("42", result.stdout().trim());
    }

    @Test
    void shouldTimeoutOnInfiniteLoop() {
        RunResult result = runner.run(Language.JAVASCRIPT, "while(true){}", "", 1000);

        assertEquals(RunStatus.TIME_LIMIT_EXCEEDED, result.status());
    }

    @Test
    void shouldReportRuntimeErrorOnJavaScriptSyntaxError() {
        RunResult result = runner.run(Language.JAVASCRIPT, "console.log(;", "", 2000);

        assertEquals(RunStatus.RUNTIME_ERROR, result.status());
    }

    @Test
    void shouldRunJavaHelloWorld() {
        String javaCode = """
                public class Main {
                    public static void main(String[] args) {
                        System.out.println("Hello World");
                    }
                }
                """;
        RunResult result = runner.run(Language.JAVA, javaCode, "", 5000);

        assertEquals(RunStatus.OK, result.status());
        assertEquals("Hello World", result.stdout().trim());
    }

    @Test
    void shouldReportCompilationErrorOnJavaMissingSemicolon() {
        String javaCode = """
                public class Main {
                    public static void main(String[] args) {
                        System.out.println("Hello World")
                    }
                }
                """;
        RunResult result = runner.run(Language.JAVA, javaCode, "", 5000);

        assertEquals(RunStatus.COMPILATION_ERROR, result.status());
        assertTrue(result.stderr().contains("error:"));
    }

    @Test
    void shouldReadStdinAndMultiplyInJavaScript() {
        String jsCode = """
                const fs = require('fs');
                const input = fs.readFileSync(0, 'utf-8').trim();
                console.log(Number(input) * 2);
                """;
        RunResult result = runner.run(Language.JAVASCRIPT, jsCode, "5", 2000);

        assertEquals(RunStatus.OK, result.status());
        assertEquals("10", result.stdout().trim());
    }
}
