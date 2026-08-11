import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      problemid: string;
    }>;
  }
) {
  const user = await getUser();

  if (!user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return Response.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { problemid } = await params;
  const problemId = Number(problemid);

  if (!Number.isInteger(problemId)) {
    return Response.json(
      { error: "Invalid problem ID" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const {
    title,
    statement,
    difficulty,
    example,
    constraints,
    timeLimit,
    memoryLimit,
    testCases,
  } = body;

  /*
   * Basic validation
   */
  if (
    !title ||
    !statement ||
    !difficulty ||
    !Array.isArray(testCases)
  ) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (testCases.length === 0) {
    return Response.json(
      { error: "At least one test case is required" },
      { status: 400 }
    );
  }

  /*
   * Check problem exists
   */
  const existingProblem =
    await prisma.problem.findUnique({
      where: {
        id: problemId,
      },
    });

  if (!existingProblem) {
    return Response.json(
      { error: "Problem not found" },
      { status: 404 }
    );
  }

  /*
   * Update problem and replace test cases
   *
   * Everything happens inside one transaction.
   */
  const updatedProblem =
    await prisma.$transaction(async (tx) => {
      const problem = await tx.problem.update({
        where: {
          id: problemId,
        },
        data: {
          title,
          statement,
          difficulty,
          example: example ?? "",
          constraints: constraints ?? "",
          timeLimit: Number(timeLimit),
          memoryLimit: Number(memoryLimit),
        },
      });

      /*
       * Remove old test cases
       */
      await tx.testCase.deleteMany({
        where: {
          problemId,
        },
      });

      /*
       * Create new test cases
       */
      await tx.testCase.createMany({
        data: testCases.map((testCase: any) => ({
          input: testCase.input,
          output: testCase.output,
          isHidden: Boolean(testCase.isHidden),
          problemId,
        })),
      });

      return problem;
    });

  return Response.json({
    message: "Problem updated successfully",
    problem: updatedProblem,
  });
}