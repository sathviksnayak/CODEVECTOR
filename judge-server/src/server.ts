import express from "express";
import { executeCppWithTestCases } from "./executeCpp.js";
import path from "path";
import fs from "fs/promises";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.post("/execute", async (req, res) => {
  let filePath: string | null = null;

  try {
    const {
      code,
      testCases,
      timeLimit,
      memoryLimit,
    } = req.body;

    if (
      typeof code !== "string" ||
      !Array.isArray(testCases)
    ) {
      return res.status(400).json({
        error: "Invalid request",
      });
    }

    /*
     * Create temp directory.
     */
    const tempDir = path.join(
      process.cwd(),
      "temp"
    );

    await fs.mkdir(tempDir, {
      recursive: true,
    });

    /*
     * Create temporary C++ source file.
     */
    const fileName =
      `submission-${Date.now()}.cpp`;

    filePath = path.join(
      tempDir,
      fileName
    );

    /*
     * Docker container mounts the project
     * directory as /app, so this is the
     * path Docker will use.
     */
    const relativePath =
      `temp/${fileName}`;

    await fs.writeFile(
      filePath,
      code
    );

    /*
     * Execute submission.
     */
    const result =
      await executeCppWithTestCases(
        relativePath,
        testCases,
        {
          timeLimit,
          memoryLimit,
        }
      );

    return res.json(result);
  } catch (error) {
    console.error(
      "Judge error:",
      error
    );

    return res.status(500).json({
      error: "Execution failed",
    });
  } finally {
    /*
     * Remove submitted C++ source.
     *
     * executeCpp.ts already removes
     * the executable and test input files.
     */
    if (filePath) {
      await fs.rm(filePath, {
        force: true,
      });
    }
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(
    `Judge server running on http://localhost:${PORT}`
  );
});