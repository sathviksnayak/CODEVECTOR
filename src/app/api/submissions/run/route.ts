import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

export async function POST(req: Request) {
  const payload = await getUser();

  if (!payload) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const {
    code,
    language,
    problemId,
  } = body;

  if (!code || !problemId) {
    return Response.json(
      { error: "Missing code or problemId" },
      { status: 400 }
    );
  }

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
   * Run only a subset of test cases.
   */
  const runTestCaseCount = Math.max(
    1,
    Math.ceil(problem.testCases.length / 3)
  );

  const formattedTestCases =
    problem.testCases
      .slice(0, runTestCaseCount)
      .map((tc) => ({
        input: tc.input,
        expectedOutput: tc.output,
      }));

  /*
   * Send code to the separate judge server.
   */
  try {
    const judgeUrl =
      process.env.JUDGE_SERVER_URL ??
      "http://localhost:4000";

    const judgeResponse = await fetch(
      `${judgeUrl}/execute`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          code,
          testCases: formattedTestCases,
          timeLimit: problem.timeLimit,
          memoryLimit: problem.memoryLimit,
        }),
      }
    );

    const result = await judgeResponse.json();

    if (!judgeResponse.ok) {
      return Response.json(
        result,
        { status: judgeResponse.status }
      );
    }

    return Response.json(result);

  } catch (error) {
    console.error(
      "Judge server error:",
      error
    );

    return Response.json(
      {
        error: "Judge server unavailable",
      },
      { status: 503 }
    );
  }
}