import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface RunConstraints {
  timeLimit?: number; // milliseconds
  memoryLimit?: number; // MB
}

export interface TestResult {
  verdict: "AC" | "WA" | "TLE" | "MLE" | "RE";
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr?: string;
  executionTime?: number; // milliseconds
  memoryUsed?: number | null; // KB
}

const normalize = (s: string) => s.trim().replace(/\r\n/g, "\n");

// Cap how much stdout/stderr we buffer from a single run.
// Anything beyond this from a spamming submission is truncated,
// not allowed to blow up the Node process.
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * jobDir is now OWNED by the caller (the route handler).
 * This function never invents its own jobId/jobDir — it only
 * works within the directory it's given, and only ever
 * references paths *relative to that directory* when talking
 * to the container (since the container's cwd is the mounted
 * jobDir, not the host's process.cwd()).
 */
export async function executeCppWithTestCases(
  jobDir: string,
  sourceFileName: string, // e.g. "submission.cpp" — relative to jobDir
  testCases: TestCase[],
  constraints: RunConstraints = {}
) {
  const timeLimitMs = constraints.timeLimit ?? 2000;
  const memoryLimitMb = constraints.memoryLimit ?? 256;
  const timeLimitSeconds = timeLimitMs / 1000;

  // Everything below is container-relative. jobDir is mounted
  // at /app inside the container, so relative paths here mean
  // the same thing on both sides of the mount.
  const executableName = "main";

  // Run stage needs GNU time (/usr/bin/time) for peak-RSS
  // measurement, which plain gcc:latest doesn't ship. Build this
  // once with judge.Dockerfile. Compile stage doesn't need it.
  const runImage = "cpp-judge:latest";
  const memoryLimitKb = memoryLimitMb * 1024;

  /*
   * Compile
   */
  try {
    const compileCommand =
      `docker run --rm ` +
      `--network none ` +
      `--cpus=1 ` +
      `--pids-limit=64 ` +
      `--cap-drop=ALL ` +
      `--security-opt=no-new-privileges ` +
      `-v "${jobDir}:/app" ` +
      `-w /app ` +
      `gcc:latest ` +
      `bash -c "g++ ${sourceFileName} -O2 -std=c++17 -o ${executableName}"`;

    await execAsync(compileCommand, { timeout: 15000 });
  } catch (error: any) {
    return {
      compileError: error.stderr || error.message || "Compilation failed",
      results: [],
      allPassed: false,
      executionTime: null,
      memoryUsed: null,
    };
  }

  const results: TestResult[] = [];

  /*
   * Run test cases
   */
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const inputFileName = `input-${i}.txt`;
    const inputFileHost = path.join(jobDir, inputFileName);

    await fs.writeFile(inputFileHost, tc.input);

    /*
     * GNU time reports both elapsed wall time (%e, seconds) and
     * peak RSS (%M, KB) in a single pass, on stderr, prefixed so
     * we can find it even if the program itself writes to stderr.
     * Example: __STATS__:0.03:18432
     */
    const runCommand =
      `docker run --rm ` +
      `--network none ` +
      `--memory=${memoryLimitMb}m ` +
      `--memory-swap=${memoryLimitMb}m ` +
      `--cpus=1 ` +
      `--pids-limit=64 ` +
      `--cap-drop=ALL ` +
      `--security-opt=no-new-privileges ` +
      `--read-only ` +
      `-v "${jobDir}:/app:ro" ` +
      `-w /app ` +
      `${runImage} ` +
      `bash -c "` +
      `timeout ${timeLimitSeconds}s ` +
      `/usr/bin/time -f '__STATS__:%e:%M' ` +
      `./${executableName} ` +
      `< ${inputFileName}` +
      `"`;

    try {
      const { stdout, stderr } = await execAsync(runCommand, {
        timeout: timeLimitMs + 5000,
        maxBuffer: MAX_OUTPUT_BYTES,
      });

      const statsMatch = stderr.match(
        /__STATS__:(\d+(?:\.\d+)?):(\d+)/
      );
      const executionTime = statsMatch
        ? Number(statsMatch[1]) * 1000
        : 0;
      const memoryUsed = statsMatch ? Number(statsMatch[2]) : null;

      const cleanStderr = stderr
        .replace(/__STATS__:\d+(?:\.\d+)?:\d+\s*/g, "")
        .trim();

      const passed = normalize(stdout) === normalize(tc.expectedOutput);
      let verdict: TestResult["verdict"] = passed ? "AC" : "WA";

      if (executionTime >= timeLimitMs) {
        verdict = "TLE";
      } else if (memoryUsed !== null && memoryUsed > memoryLimitKb) {
        // Docker's --memory can be soft-enforced (e.g. page cache
        // pressure reclaimed instead of an OOM kill), so don't rely
        // solely on exit code 137 — check the measured peak too.
        verdict = "MLE";
      }

      results.push({
        verdict,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: stdout,
        stderr: cleanStderr,
        executionTime,
        memoryUsed,
      });
    } catch (error: any) {
      const stderr = error.stderr || error.message || "";
      const statsMatch = stderr.match(
        /__STATS__:(\d+(?:\.\d+)?):(\d+)/
      );
      const executionTime = statsMatch
        ? Number(statsMatch[1]) * 1000
        : timeLimitMs;
      // OOM kills (SIGKILL from the kernel) can happen before GNU
      // time gets to write its stats line, so this may still be
      // null even when the true cause was memory. That's fine —
      // error.code === 137 below covers that case independently.
      const memoryUsed = statsMatch ? Number(statsMatch[2]) : null;

      let verdict: TestResult["verdict"] = "RE";

      if (error.code === 124) {
        // GNU timeout
        verdict = "TLE";
      } else if (error.code === 137) {
        // OOM-killed by Docker/the kernel
        verdict = "MLE";
      } else if (memoryUsed !== null && memoryUsed > memoryLimitKb) {
        verdict = "MLE";
      } else if (error.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
        // Submission spammed stdout/stderr past MAX_OUTPUT_BYTES.
        // Treat as a runtime failure rather than crashing the judge.
        verdict = "RE";
      } else if (executionTime >= timeLimitMs) {
        verdict = "TLE";
      }

      results.push({
        verdict,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: "",
        stderr,
        executionTime,
        memoryUsed,
      });
    } finally {
      await fs.rm(inputFileHost, { force: true });
    }
  }

  const executionTime =
    results.length > 0
      ? Math.max(...results.map((r) => r.executionTime ?? 0))
      : 0;

  const measuredMemory = results
    .map((r) => r.memoryUsed)
    .filter((m): m is number => m !== null);

  const memoryUsed =
    measuredMemory.length > 0 ? Math.max(...measuredMemory) : null;

  return {
    results,
    allPassed:
      results.length > 0 && results.every((r) => r.verdict === "AC"),
    executionTime,
    memoryUsed,
  };
}