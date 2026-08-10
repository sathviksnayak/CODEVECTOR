import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

export async function POST(req: Request) {
  try {
    const payload = await getUser();

    if (!payload) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      title,
      startTime,
      endTime,
      problemIds,
    } = body;

    if (!title || !startTime || !endTime) {
      return Response.json(
        {
          error:
            "Title, start time and end time are required",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(problemIds) ||
      problemIds.length === 0
    ) {
      return Response.json(
        {
          error:
            "At least one problem must be selected",
        },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return Response.json(
        { error: "Invalid date/time" },
        { status: 400 }
      );
    }

    if (end <= start) {
      return Response.json(
        {
          error:
            "End time must be after start time",
        },
        { status: 400 }
      );
    }

    /*
     * Verify that all selected problems exist.
     */
    const ids = problemIds.map(Number);

    const problems =
      await prisma.problem.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
        },
      });

    if (problems.length !== ids.length) {
      return Response.json(
        {
          error:
            "One or more selected problems do not exist",
        },
        { status: 400 }
      );
    }

    /*
     * Create contest and contest problems
     * atomically.
     */
    const contest = await prisma.$transaction(
      async (tx) => {
        const createdContest =
          await tx.contest.create({
            data: {
              title: title.trim(),
              startTime: start,
              endTime: end,
            },
          });

        await tx.contestProblem.createMany({
          data: ids.map((problemId) => ({
            contestId: createdContest.id,
            problemId,
          })),
        });

        return createdContest;
      }
    );

    return Response.json(
      {
        message: "Contest created successfully",
        contest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create contest error:",
      error
    );

    return Response.json(
      {
        error: "Failed to create contest",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const contests = await prisma.contest.findMany({
      orderBy: {
        startTime: "desc",
      },
    });

    return Response.json(contests);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to fetch contests" },
      { status: 500 }
    );
  }
}