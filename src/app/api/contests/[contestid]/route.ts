
import { prisma } from "@/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ contestid: string }> }
) {
  const { contestid } = await params;

  const contest = await prisma.contest.findUnique({
    where: {
      id: Number(contestid),
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  return Response.json(contest);
}