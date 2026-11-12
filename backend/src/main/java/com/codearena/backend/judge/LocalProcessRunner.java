package com.codearena.backend.judge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

@Component
@ConditionalOnProperty(name = "judge.runner", havingValue = "local", matchIfMissing = true)
public class LocalProcessRunner implements CodeRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalProcessRunner.class);

    public LocalProcessRunner() {
        log.warn("LocalProcessRunner is NOT SAFE for untrusted code.");
    }

    @Override
    public RunResult run(Language language, String sourceCode, String stdin, int timeLimitMs) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("codearena-run-");

            List<String> command;
            if (language == Language.JAVASCRIPT) {
                Path sourceFile = tempDir.resolve("main.js");
                Files.writeString(sourceFile, sourceCode != null ? sourceCode : "", StandardCharsets.UTF_8);
                command = List.of("node", "main.js");
            } else if (language == Language.JAVA) {
                Path sourceFile = tempDir.resolve("Main.java");
                Files.writeString(sourceFile, sourceCode != null ? sourceCode : "", StandardCharsets.UTF_8);
                command = List.of("java", "-Xmx256m", "Main.java");
            } else {
                throw new IllegalArgumentException("Unsupported language: " + language);
            }

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.directory(tempDir.toFile());

            long startTime = System.currentTimeMillis();
            Process process = pb.start();

            StreamGobbler stdoutGobbler = new StreamGobbler(process.getInputStream());
            StreamGobbler stderrGobbler = new StreamGobbler(process.getErrorStream());

            Thread stdoutThread = new Thread(stdoutGobbler);
            Thread stderrThread = new Thread(stderrGobbler);

            stdoutThread.start();
            stderrThread.start();

            try (OutputStream os = process.getOutputStream()) {
                if (stdin != null && !stdin.isEmpty()) {
                    os.write(stdin.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }
            } catch (IOException ignored) {
                // Process might have terminated early or closed input stream
            }

            int timeout = timeLimitMs > 0 ? timeLimitMs : 2000;
            boolean finished = process.waitFor(timeout, TimeUnit.MILLISECONDS);
            long runtimeMs = System.currentTimeMillis() - startTime;

            if (!finished) {
                try {
                    process.descendants().forEach(ProcessHandle::destroyForcibly);
                } catch (Exception ignored) {
                }
                process.destroyForcibly();
                try {
                    process.waitFor(500, TimeUnit.MILLISECONDS);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
                try {
                    stdoutThread.join(500);
                    stderrThread.join(500);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
                return new RunResult(RunStatus.TIME_LIMIT_EXCEEDED, stdoutGobbler.getContent(), stderrGobbler.getContent(), runtimeMs);
            }

            try {
                stdoutThread.join(1000);
                stderrThread.join(1000);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }

            int exitCode = process.exitValue();
            String stdout = stdoutGobbler.getContent();
            String stderr = stderrGobbler.getContent();

            RunStatus status;
            if (exitCode == 0) {
                status = RunStatus.OK;
            } else if (language == Language.JAVA && stderr.contains("error:")) {
                status = RunStatus.COMPILATION_ERROR;
            } else {
                status = RunStatus.RUNTIME_ERROR;
            }

            return new RunResult(status, stdout, stderr, runtimeMs);

        } catch (Exception e) {
            return new RunResult(RunStatus.RUNTIME_ERROR, "", e.getMessage() != null ? e.getMessage() : e.toString(), 0);
        } finally {
            if (tempDir != null) {
                deleteRecursively(tempDir);
            }
        }
    }

    private void deleteRecursively(Path path) {
        if (path == null || !Files.exists(path)) {
            return;
        }
        try (Stream<Path> walk = Files.walk(path)) {
            walk.sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                        } catch (IOException e) {
                            p.toFile().deleteOnExit();
                        }
                    });
        } catch (IOException ignored) {
        }
    }

    private static class StreamGobbler implements Runnable {
        private final InputStream inputStream;
        private final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        private final int limit = 64 * 1024;

        StreamGobbler(InputStream inputStream) {
            this.inputStream = inputStream;
        }

        @Override
        public void run() {
            try {
                byte[] buffer = new byte[4096];
                int bytesRead;
                int totalSaved = 0;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    if (totalSaved < limit) {
                        int toWrite = Math.min(bytesRead, limit - totalSaved);
                        outputStream.write(buffer, 0, toWrite);
                        totalSaved += toWrite;
                    }
                }
            } catch (IOException ignored) {
            }
        }

        public String getContent() {
            return outputStream.toString(StandardCharsets.UTF_8);
        }
    }
}
