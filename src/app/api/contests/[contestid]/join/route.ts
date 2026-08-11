import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      contestid: string;
    }>;
  }
) {
  const user = await getUser();
  const { contestid } = await params;

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const contestId = Number(contestid);

  if (!Number.isInteger(contestId)) {
    return NextResponse.json(
      { error: "Invalid contest ID" },
      { status: 400 }
    );
  }

  const contest = await prisma.contest.findUnique({
    where: {
      id: contestId,
    },
  });

  if (!contest) {
    return NextResponse.json(
      { error: "Contest not found" },
      { status: 404 }
    );
  }

  const now = new Date();

  /*
   * Users can join:
   *
   * - before the contest starts
   * - while the contest is live
   *
   * They cannot join once it has ended.
   */
  if (now >= contest.endTime) {
    return NextResponse.json(
      {
        error: "Contest has already ended",
      },
      { status: 400 }
    );
  }

  /*
   * Check whether the user has already joined.
   */
  const existingParticipant =
    await prisma.contestParticipant.findUnique({
      where: {
        contestId_userId: {
          contestId: contest.id,
          userId: user.id,
        },
      },
    });

  if (existingParticipant) {
    return NextResponse.json(
      {
        message: "joined",
      },
      { status: 200 }
    );
  }

  /*
   * Register the user as a participant.
   */
  await prisma.contestParticipant.create({
    data: {
      contestId: contest.id,
      userId: user.id,
    },
  });

  return NextResponse.json(
    {
      message: "Joined contest successfully",
    },
    { status: 201 }
  );
}