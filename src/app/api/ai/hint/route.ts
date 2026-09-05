import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { generateHint } from "@/lib/ai/generatehint";

export async function GET(req: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const problemId = Number(
      new URL(req.url).searchParams.get("problemId")
    );

    if (!Number.isInteger(problemId) || problemId <= 0) {
      return NextResponse.json(
        { error: "Invalid problem ID" },
        { status: 400 }
      );
    }

    const usage =
      await prisma.problemHintUsage.findUnique({
        where: {
          userId_problemId: {
            userId: user.id,
            problemId,
          },
        },
      });

    if (!usage) {
      return NextResponse.json({
        hints: [],
        hintsUsed: 0,
        hintsRemaining: 3,
        hintLimit: 3,
      });
    }

    return NextResponse.json({
      hints: usage.hints,
      hintsUsed: usage.hintsUsed,
      hintsRemaining: Math.max(0, 3 - usage.hintsUsed),
      hintLimit: 3,
    });
  } catch (error) {
    console.error(
      "Hint history retrieval error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to retrieve hint history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { submissionId } = await req.json();

    if (
      typeof submissionId !== "number" ||
      !Number.isInteger(submissionId)
    ) {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 }
      );
    }

    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const submission =
      await prisma.submission.findUnique({
        where: {
          id: submissionId,
        },
        include: {
          problem: true,
        },
      });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    /*
     * Check submission ownership
     */
if (submission.userId !== user.id) {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

    /*
     * Hints only allowed after Wrong Answer
     */
    if (submission.verdict !== "WA") {
      return NextResponse.json(
        {
          error:
            "Hints are only available for Wrong Answer submissions",
        },
        { status: 403 }
      );
    }

    /*
     * No hints during contests
     */
    if (submission.contestId !== null) {
      return NextResponse.json(
        {
          error:
            "Hints are not available during contests",
        },
        { status: 403 }
      );
    }

    /*
     * Check hint usage
     */
    const usage =
      await prisma.problemHintUsage.findUnique({
        where: {
          userId_problemId: {
            userId: user.id,
            problemId: submission.problemId,
          },
        },
      });

    if (usage && usage.hintsUsed >= 3) {
      return NextResponse.json(
        { error: "No hints remaining" },
        { status: 403 }
      );
    }

    const previousHints = usage?.hints ?? [];

    /*
     * Generate hint
     */
    const hint = await generateHint({
      problem: submission.problem.statement,
      constraints: submission.problem.constraints,
      code: submission.code,
      previousHints,
    });

    /*
     * Consume one hint
     */
    await prisma.problemHintUsage.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: submission.problemId,
        },
      },
      update: {
        hintsUsed: {
          increment: 1,
        },
        hints: {
          push: hint,
        },
      },
      create: {
        userId: user.id,
        problemId: submission.problemId,
        hintsUsed: 1,
        hints: [hint],
      },
    });

    return NextResponse.json({
      hint,
    });
  } catch (error) {
    console.error(
      "Hint generation error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to generate hint" },
      { status: 500 }
    );
  }
}