import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
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

    if (
      !title ||
      !statement ||
      !difficulty ||
      !testCases ||
      testCases.length === 0
    ) {
      return Response.json(
        {
          error:
            "Title, statement, difficulty and test cases are required",
        },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        statement,
        difficulty,
        example: example ?? "",
        constraints: constraints ?? "",
        timeLimit: Number(timeLimit),
        memoryLimit: Number(memoryLimit),

        testCases: {
          create: testCases.map(
            (testCase: {
              input: string;
              output: string;
              isHidden: boolean;
            }) => ({
              input: testCase.input,
              output: testCase.output,
              isHidden: testCase.isHidden,
            })
          ),
        },
      },

      include: {
        testCases: true,
      },
    });

    return Response.json(
      {
        success: true,
        problem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE PROBLEM ERROR:",
      error
    );

    return Response.json(
      {
        error: "Failed to create problem",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const problems = await prisma.problem.findMany({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      title: true,
      difficulty: true,
    },
  });

  return Response.json(problems);
}