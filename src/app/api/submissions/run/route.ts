import { prisma } from "@/lib/prisma";
import { executeCppWithTestCases } from "@/lib/executeCpp";
import path from "path";
import fs from "fs/promises";
import { getUser } from "@/lib/getUser";

export async function POST(req: Request) {
  const payload = await getUser();

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { code, language, problemId } = body;

  if (!code || !problemId) {
    return Response.json(
      { error: "Missing code or problemId" },
      { status: 400 }
    );
  }

  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(problemId), // fixed: was a raw string before
    },
    include: {
      testCases: true,
    },
  });

  if (!problem) {
    return Response.json(
      { error: "Problem not found" },
      { status: 404 }
    );
  }

  /*
   * Create temporary source file
   */
  await fs.mkdir(path.join(process.cwd(), "temp"), { recursive: true });

  const fileName = `run-${Date.now()}.cpp`;
  const filePath = path.join(process.cwd(), "temp", fileName);
  const relativePath = `temp/${fileName}`;

  await fs.writeFile(filePath, code);

const runTestCaseCount = Math.max(
  1,
  Math.ceil(problem.testCases.length / 3)
);

const formattedTestCases = problem.testCases
  .slice(0, runTestCaseCount)
  .map((tc) => ({
    input: tc.input,
    expectedOutput: tc.output,
  }));

  let result;
  try {
    result = await executeCppWithTestCases(
      relativePath,
      formattedTestCases,
      {
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
      }
    );
  } catch (err: any) {
    // e.g. compiler crash / unexpected executor failure
    await fs.unlink(filePath).catch(() => {});
    return Response.json(
      { error: "Execution failed", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }

  await fs.unlink(filePath).catch(() => {});

  return Response.json(result);
}