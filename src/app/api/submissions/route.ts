import { prisma } from "@/lib/prisma";  
import {  executeCppWithTestCases } from "@/lib/executeCpp";
import path from "path";
import fs from "fs/promises";


export async function POST(req: Request) {
  const body = await req.json();

  const code=body.code;
  const language=body.language;
  const problemId=body.problemId;




await fs.mkdir(
  path.join(process.cwd(), "temp"),
  { recursive: true }
);

const fileName = `submission-${Date.now()}.cpp`;

const filePath = path.join(
  process.cwd(),
  "temp",
  fileName
);

const relativePath = `temp/${fileName}`;

await fs.writeFile(filePath, code);

const problem = await prisma.problem.findUnique({
  where: {
    id: problemId,
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

const formattedTestCases =
  problem.testCases.map(tc => ({
    input: tc.input,
    expectedOutput: tc.output,
  }));

const result =
  await executeCppWithTestCases(
    relativePath,
    formattedTestCases,
    {
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    }
  );

  const verdict =
  result.allPassed
    ? "AC"
    : result.results.find(
        r => r.verdict !== "AC"
      )?.verdict ?? "WA";


      await prisma.submission.create({
  data: {
    code,
    language,
    problemId,
    userId: 1,
    verdict,
  },
});

  console.log(result);
  return Response.json(result);
}



export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const problemId = searchParams.get("problemId");

  const submissions =
    await prisma.submission.findMany({
      where: {
        problemId: Number(problemId),
        userId: 1, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return Response.json(submissions);
}