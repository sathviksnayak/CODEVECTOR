import { prisma } from "@/lib/prisma";  

export async function POST(req: Request) {
  const body = await req.json();

  const submission =
    await prisma.submission.create({
      data: {
        code: body.code,
        language: body.language,
        problemId: body.problemId,
        userId: 1,
        verdict: "PENDING",
      },
    });

  return Response.json(submission);
}