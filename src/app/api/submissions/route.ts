import { prisma } from "@/lib/prisma";
import { executeCppWithTestCases } from "@/lib/executeCpp";
import path from "path";
import fs from "fs/promises";
import { getUser } from "@/lib/getUser";

export async function POST(req: Request) {
  const body = await req.json();

  const payload = await getUser();

  if (!payload) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const {
    code,
    language,
    problemId,
    contestId,
  } = body;

  /*
   * Contest validation
   */
  if (contestId) {
    const contest = await prisma.contest.findUnique({
      where: {
        id: Number(contestId),
      },
    });

    if (!contest) {
      return Response.json(
        { error: "Contest not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    if (now < contest.startTime) {
      return Response.json(
        { error: "Contest has not started" },
        { status: 403 }
      );
    }

    if (now > contest.endTime) {
      return Response.json(
        { error: "Contest has ended" },
        { status: 403 }
      );
    }

    /*
     * Check user joined contest
     */
    const participant =
      await prisma.contestParticipant.findUnique({
        where: {
          contestId_userId: {
            contestId: contest.id,
            userId: payload.id,
          },
        },
      });

    if (!participant) {
      return Response.json(
        {
          error: "You have not joined this contest",
        },
        { status: 403 }
      );
    }

    /*
     * Check problem belongs to contest
     */
    const contestProblem =
      await prisma.contestProblem.findUnique({
        where: {
          contestId_problemId: {
            contestId: contest.id,
            problemId: Number(problemId),
          },
        },
      });

    if (!contestProblem) {
      return Response.json(
        {
          error: "Problem does not belong to contest",
        },
        { status: 403 }
      );
    }
  }

  /*
   * Get problem + test cases
   */
  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(problemId),
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
  await fs.mkdir(
    path.join(process.cwd(), "temp"),
    { recursive: true }
  );

  const fileName = `submission-${Date.now()}.cpp`;

  const filePath = path.join(
    process.cwd(),
    "temp",
    fileName
  );

  const relativePath = `temp/${fileName}`;

  await fs.writeFile(filePath, code);

  /*
   * Execute code
   */
  const formattedTestCases =
    problem.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.output,
    }));

  const result =
    await executeCppWithTestCases(
      relativePath,
      formattedTestCases,
      {
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
      }
    );

const verdict = result.compileError
  ? "CE"
  : result.allPassed
    ? "AC"
    : result.results.find(
        (r) => r.verdict !== "AC"
      )?.verdict ?? "WA";
  /*
   * Save submission
   */
  await prisma.submission.create({
    data: {
      code,
      language,
      problemId: Number(problemId),
      userId: payload.id,
      verdict,

      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,

      contestId: contestId
        ? Number(contestId)
        : null,
    },
  });

  /*
   * Delete temporary file
   */
  await fs.unlink(filePath).catch(() => {});

  return Response.json(result);
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const problemId = searchParams.get("problemId");

  if (!problemId) {
    return Response.json(
      { error: "problemId is required" },
      { status: 400 }
    );
  }

  const submissions = await prisma.submission.findMany({
    where: {
      problemId: Number(problemId),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(submissions);
}