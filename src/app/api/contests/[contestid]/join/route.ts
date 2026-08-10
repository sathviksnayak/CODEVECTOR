import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ contestid: string }> }
) {
  const user = await getUser();
  const { contestid } = await params;

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const contest = await prisma.contest.findUnique({
    where: {
      id: Number(contestid),
    },
  });

  if (!contest) {
    return NextResponse.json(
      { error: "Contest not found" },
      { status: 404 }
    );
  }

  const now = new Date();

  if (now > contest.endTime) {
    return NextResponse.json(
      { error: "Contest has already ended" },
      { status: 400 }
    );
  }

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
      { message :"joined" },
      { status: 200 }
    );
  }

  await prisma.contestParticipant.create({
    data: {
      contestId: contest.id,
      userId: user.id,
    },
  });

  return NextResponse.json(
    { message: "Joined contest successfully" },
    { status: 201 }
  );
}