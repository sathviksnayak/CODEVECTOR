import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ contestid: string }>;
  }
) {
  try {
    // -----------------------------
    // Authentication
    // -----------------------------

    const user = await getUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -----------------------------
    // Authorization
    // -----------------------------

    if (user.role ==="USER") {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // -----------------------------
    // Get contest ID
    // -----------------------------

    const { contestid } = await params;

    const contestId = Number(contestid);

    if (Number.isNaN(contestId)) {
      return Response.json(
        { error: "Invalid contest ID" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Read request body
    // -----------------------------

    const body = await req.json();

    const {
      title,
      startTime,
      endTime,
      problemIds,
    } = body;

    // -----------------------------
    // Validate input
    // -----------------------------

    if (
      !title ||
      !startTime ||
      !endTime ||
      !Array.isArray(problemIds)
    ) {
      return Response.json(
        {
          error:
            "Title, start time, end time and problems are required",
        },
        { status: 400 }
      );
    }

    if (problemIds.some((id: unknown) => typeof id !== "number")) {
      return Response.json(
        { error: "Invalid problem IDs" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Parse dates
    // -----------------------------

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return Response.json(
        { error: "Invalid start or end time" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return Response.json(
        {
          error: "End time must be after start time",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Find contest
    // -----------------------------

    const existingContest =
      await prisma.contest.findUnique({
        where: {
          id: contestId,
        },
      });

    if (!existingContest) {
      return Response.json(
        { error: "Contest not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Only upcoming contests
    // -----------------------------

    if (new Date() >= existingContest.startTime) {
      return Response.json(
        {
          error:
            "Only upcoming contests can be edited",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Verify problems exist
    // -----------------------------

    const uniqueProblemIds = [
      ...new Set(problemIds as number[]),
    ];

    const problems =
      await prisma.problem.findMany({
        where: {
          id: {
            in: uniqueProblemIds,
          },
        },
        select: {
          id: true,
        },
      });

    if (
      problems.length !==
      uniqueProblemIds.length
    ) {
      return Response.json(
        {
          error:
            "One or more selected problems do not exist",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Update contest
    // -----------------------------

    const updatedContest =
      await prisma.$transaction(async (tx) => {
        // Update basic contest information
        const contest =
          await tx.contest.update({
            where: {
              id: contestId,
            },

            data: {
              title: title.trim(),
              startTime: start,
              endTime: end,
            },
          });

        // Remove old problem associations
        await tx.contestProblem.deleteMany({
          where: {
            contestId,
          },
        });

        // Add new problem associations
        if (uniqueProblemIds.length > 0) {
          await tx.contestProblem.createMany({
            data: uniqueProblemIds.map(
              (problemId) => ({
                contestId,
                problemId,
              })
            ),
          });
        }

        // Return updated contest
        return tx.contest.findUnique({
          where: {
            id: contestId,
          },

          include: {
            problems: {
              include: {
                problem: true,
              },
            },
          },
        });
      });

    // -----------------------------
    // Response
    // -----------------------------

    return Response.json(updatedContest);
  } catch (error) {
    console.error(
      "UPDATE CONTEST ERROR:",
      error
    );

    return Response.json(
      {
        error: "Failed to update contest",
      },
      { status: 500 }
    );
  }
}