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
  timeLimit?: number;
  memoryLimit?: number;
}

export interface TestResult {
  verdict: "AC" | "WA" | "TLE" | "MLE" | "RE";
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr?: string;
}

const normalize = (s: string) => s.trim().replace(/\r\n/g, "\n");

export async function executeCppWithTestCases(
  filePath: string,
  testCases: TestCase[],
  constraints: RunConstraints = {}
) {
  const timeLimit = constraints.timeLimit ?? 2;
  const memoryLimit = constraints.memoryLimit ?? 256;

  const jobId = `main-${Date.now()}`;
  const executablePath = path.posix.join("temp", jobId);

  try {
    const compileCommand = `docker run --rm -v "${process.cwd()}:/app" -w /app gcc:latest bash -c "g++ ${filePath} -O2 -std=c++17 -o ${executablePath}"`;
    await execAsync(compileCommand, { timeout: 15000 });
  } catch (error: any) {
    return {
      compileError: error.stderr || error.message,
      results: [],
      allPassed: false,
    };
  }

  const results: TestResult[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];

    // Write input to a real file — no shell quoting involved at all
    const inputFileName = `${jobId}-input-${i}.txt`;
    const inputFileHost = path.join(process.cwd(), "temp", inputFileName);
    const inputFileContainer = path.posix.join("temp", inputFileName);

    await fs.writeFile(inputFileHost, tc.input);

    // Redirect stdin FROM the file instead of piping through printf
    const runCommand = `docker run --rm --memory=${memoryLimit}m --memory-swap=${memoryLimit}m -v "${process.cwd()}:/app" -w /app gcc:latest bash -c "timeout ${timeLimit}s ./${executablePath} < ${inputFileContainer}"`;

    try {
      const { stdout, stderr } = await execAsync(runCommand, {
        timeout: (timeLimit + 3) * 1000,
      });

      const passed = normalize(stdout) === normalize(tc.expectedOutput);

      results.push({
        verdict: passed ? "AC" : "WA",
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: stdout,
        stderr,
      });
    } catch (error: any) {
      const stderr = error.stderr || error.message || "";
      let verdict: TestResult["verdict"] = "RE";

      if (error.killed || error.code === 124) {
        verdict = "TLE";
      } else if (error.code === 137) {
        verdict = /oom|memory|killed/i.test(stderr) ? "MLE" : "TLE";
      }

      results.push({
        verdict,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: "",
        stderr,
      });
    } finally {
      await fs.rm(inputFileHost, { force: true });
    }
  }

  return {
    results,
    allPassed: results.every((r) => r.verdict === "AC"),
  };
}