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

const normalize = (s: string) =>
  s.trim().replace(/\r\n/g, "\n");

export async function executeCppWithTestCases(
  filePath: string,
  testCases: TestCase[],
  constraints: RunConstraints = {}
) {
  const timeLimitMs =
    constraints.timeLimit ?? 2000;

  const memoryLimitMb =
    constraints.memoryLimit ?? 256;

  const timeLimitSeconds =
    timeLimitMs / 1000;

  const jobId = `main-${Date.now()}`;

  const executablePath =
    path.posix.join("temp", jobId);

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
      `-v "${process.cwd()}:/app" ` +
      `-w /app ` +
      `gcc:latest ` +
      `bash -c "g++ ${filePath} -O2 -std=c++17 -o ${executablePath}"`;

    await execAsync(compileCommand, {
      timeout: 15000,
    });
  } catch (error: any) {
    /*
     * Compilation failed.
     *
     * Remove executable just in case
     * something was partially created.
     */
    await fs.rm(
      path.join(process.cwd(), executablePath),
      { force: true }
    );

    return {
      compileError:
        error.stderr ||
        error.message ||
        "Compilation failed",

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
  try {
    for (
      let i = 0;
      i < testCases.length;
      i++
    ) {
      const tc = testCases[i];

      const inputFileName =
        `${jobId}-input-${i}.txt`;

      const inputFileHost =
        path.join(
          process.cwd(),
          "temp",
          inputFileName
        );

      const inputFileContainer =
        path.posix.join(
          "temp",
          inputFileName
        );

      await fs.writeFile(
        inputFileHost,
        tc.input
      );

      /*
       * Bash's built-in time.
       *
       * Example:
       * __TIME__:0.003
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
        `-v "${process.cwd()}:/app" ` +
        `-w /app ` +
        `gcc:latest ` +
        `bash -c "` +
        `TIMEFORMAT='__TIME__:%R'; ` +
        `time timeout ${timeLimitSeconds}s ` +
        `./${executablePath} ` +
        `< ${inputFileContainer}` +
        `"`;

      try {
        const {
          stdout,
          stderr,
        } = await execAsync(
          runCommand,
          {
            /*
             * Give Docker some overhead.
             */
            timeout:
              timeLimitMs + 5000,
          }
        );

        /*
         * Extract execution time.
         */
        const timeMatch =
          stderr.match(
            /__TIME__:(\d+(?:\.\d+)?)/
          );

        const executionTime =
          timeMatch
            ? Number(timeMatch[1]) * 1000
            : 0;

        /*
         * Remove timing information
         * from stderr.
         */
        const cleanStderr =
          stderr
            .replace(
              /__TIME__:\d+(?:\.\d+)?\s*/g,
              ""
            )
            .trim();

        /*
         * Compare output.
         */
        const passed =
          normalize(stdout) ===
          normalize(tc.expectedOutput);

        let verdict:
          TestResult["verdict"] =
          passed ? "AC" : "WA";

        /*
         * Time limit exceeded.
         */
        if (
          executionTime >
          timeLimitMs
        ) {
          verdict = "TLE";
        }

        results.push({
          verdict,

          input: tc.input,

          expectedOutput:
            tc.expectedOutput,

          actualOutput:
            stdout,

          stderr:
            cleanStderr,

          executionTime,

          /*
           * Memory isn't being measured yet.
           */
          memoryUsed: null,
        });
      } catch (error: any) {
        const stderr =
          error.stderr ||
          error.message ||
          "";

        /*
         * Try to extract timing
         * even when process was terminated.
         */
        const timeMatch =
          stderr.match(
            /__TIME__:(\d+(?:\.\d+)?)/
          );

        const executionTime =
          timeMatch
            ? Number(timeMatch[1]) * 1000
            : timeLimitMs;

        let verdict:
          TestResult["verdict"] =
          "RE";

        /*
         * GNU timeout returns 124.
         */
        if (
          error.code === 124
        ) {
          verdict = "TLE";
        }

        /*
         * Docker/container killed
         * because memory limit was exceeded.
         */
        else if (
          error.code === 137
        ) {
          verdict = "MLE";
        }

        /*
         * Outer Node timeout.
         */
        else if (
          executionTime >=
          timeLimitMs
        ) {
          verdict = "TLE";
        }

        results.push({
          verdict,

          input: tc.input,

          expectedOutput:
            tc.expectedOutput,

          actualOutput: "",

          stderr,

          executionTime,

          memoryUsed: null,
        });
      } finally {
        /*
         * Delete this test case's
         * temporary input file.
         */
        await fs.rm(
          inputFileHost,
          {
            force: true,
          }
        );
      }
    }
  } finally {
    /*
     * Delete the compiled executable.
     */
    await fs.rm(
      path.join(
        process.cwd(),
        executablePath
      ),
      {
        force: true,
      }
    );
  }

  /*
   * For multiple test cases,
   * report maximum execution time.
   */
  const executionTime =
    results.length > 0
      ? Math.max(
          ...results.map(
            (r) =>
              r.executionTime ?? 0
          )
        )
      : 0;

  /*
   * Memory isn't being measured yet.
   *
   * Docker is still enforcing
   * the memory limit.
   */
  const memoryUsed = null;

  return {
    results,

    allPassed:
      results.length > 0 &&
      results.every(
        (r) => r.verdict === "AC"
      ),

    executionTime,

    memoryUsed,
  };
}