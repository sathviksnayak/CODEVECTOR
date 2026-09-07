import express from "express";
import { executeCppWithTestCases } from "./executeCpp.js";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import "dotenv/config";


const app = express();

app.use(express.json({ limit: "1mb" }));

// Bounds for judge constraints. Anything outside these is rejected
// rather than silently clamped, so a bad request fails loudly
// instead of quietly running with different limits than asked for.
const MIN_TIME_LIMIT_MS = 100;
const MAX_TIME_LIMIT_MS = 10_000;
const MIN_MEMORY_LIMIT_MB = 16;
const MAX_MEMORY_LIMIT_MB = 512;
const MAX_TEST_CASES = 100;
const MAX_INPUT_BYTES = 64 * 1024; // 64KB per test case input

// Each job can launch a compiler and multiple Docker runtime containers.
// Keep two jobs active so a single judge instance cannot be overwhelmed by
// concurrent Docker work; excess requests are rejected instead of queued.
const MAX_CONCURRENT_JOBS = 2;
let activeJobs = 0;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/execute", async (req, res) => {
  const judgeSecret = process.env.JUDGE_SERVER_SECRET;
  console.log("Judge secret:", judgeSecret ? "configured" : "not configured");
  if (!judgeSecret) {
    return res.status(503).json({
      error: "Judge server authentication is not configured",
    });
  }

  if (req.header("x-judge-secret") !== judgeSecret) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  if (activeJobs >= MAX_CONCURRENT_JOBS) {
    return res.status(429).json({
      error: "Judge is busy",
    });
  }

  activeJobs += 1;

  let jobDir: string | null = null;

  try {
    const { code, testCases, timeLimit, memoryLimit } = req.body;

    if (typeof code !== "string" || !Array.isArray(testCases)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (testCases.length === 0 || testCases.length > MAX_TEST_CASES) {
      return res.status(400).json({
        error: `testCases must contain between 1 and ${MAX_TEST_CASES} test cases`,
      });
    }

    for (const tc of testCases) {
      if (
        typeof tc !== "object" ||
        tc === null ||
        typeof tc.input !== "string" ||
        typeof tc.expectedOutput !== "string"
      ) {
        return res.status(400).json({ error: "Invalid test case" });
      }

      if (
        Buffer.byteLength(tc.input, "utf8") > MAX_INPUT_BYTES ||
        Buffer.byteLength(tc.expectedOutput, "utf8") > MAX_INPUT_BYTES
      ) {
        return res.status(400).json({
          error: `each test case's input/expectedOutput must be under ${MAX_INPUT_BYTES} bytes`,
        });
      }
    }

    if (timeLimit !== undefined) {
      if (
        typeof timeLimit !== "number" ||
        !Number.isFinite(timeLimit) ||
        timeLimit < MIN_TIME_LIMIT_MS ||
        timeLimit > MAX_TIME_LIMIT_MS
      ) {
        return res.status(400).json({
          error: `timeLimit must be a number between ${MIN_TIME_LIMIT_MS} and ${MAX_TIME_LIMIT_MS} (ms)`,
        });
      }
    }

    if (memoryLimit !== undefined) {
      if (
        typeof memoryLimit !== "number" ||
        !Number.isFinite(memoryLimit) ||
        memoryLimit < MIN_MEMORY_LIMIT_MB ||
        memoryLimit > MAX_MEMORY_LIMIT_MB
      ) {
        return res.status(400).json({
          error: `memoryLimit must be a number between ${MIN_MEMORY_LIMIT_MB} and ${MAX_MEMORY_LIMIT_MB} (MB)`,
        });
      }
    }

    const tempDir = path.join(process.cwd(), "temp");
    await fs.mkdir(tempDir, { recursive: true });

    // Single source of truth for this submission's working directory.
    // Both the source file and every input file for this job live
    // here, and it's the only directory mounted into the container.
    const jobId = `main-${crypto.randomUUID()}`;
    jobDir = path.join(tempDir, jobId);
    await fs.mkdir(jobDir, { recursive: true });

    const sourceFileName = "submission.cpp";
    await fs.writeFile(path.join(jobDir, sourceFileName), code);

    const result = await executeCppWithTestCases(
      jobDir,
      sourceFileName,
      testCases,
      { timeLimit, memoryLimit }
    );

    return res.json(result);
  } catch (error) {
    console.error("Judge error:", error);
    return res.status(500).json({ error: "Execution failed" });
  } finally {
    // Whole submission workspace (source, binary, leftover input
    // files) is removed here, and only here — the judge function
    // no longer owns or deletes any part of this directory itself.
    try {
      if (jobDir) {
        await fs.rm(jobDir, { recursive: true, force: true });
      }
    } finally {
      activeJobs -= 1;
    }
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Judge server running on http://localhost:${PORT}`);
});