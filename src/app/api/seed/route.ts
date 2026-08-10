import { prisma } from "@/lib/prisma";

export async function GET() {
  const problem = await prisma.problem.create({
data: {
  title: "Binary Search",
  statement:
    "Given a sorted array of integers and a target value, return the index of the target. Return -1 if the target does not exist.",
  difficulty: "EASY",
  example:
    "Input: nums=[1,2,3,4,5], target=4\nOutput: 3",
  constraints:
    "1 <= n <= 10^5\n-10^9 <= nums[i] <= 10^9\nThe array is sorted in non-decreasing order.",
  timeLimit: 1000,
  memoryLimit: 256,
  testCases: {
    create: [
      {
        input: "5\n1 2 3 4 5\n4",
        output: "3",
        isHidden: false,
      },
      {
        input: "5\n1 2 3 4 5\n1",
        output: "0",
        isHidden: false,
      },
      {
        input: "5\n1 2 3 4 5\n6",
        output: "-1",
        isHidden: false,
      },

      // Hidden
      {
        input: "7\n-10 -5 -2 0 3 8 12\n-2",
        output: "2",
        isHidden: true,
      },
      {
        input: "8\n2 4 6 8 10 12 14 16\n14",
        output: "6",
        isHidden: true,
      },
      {
        input: "6\n1 3 5 7 9 11\n8",
        output: "-1",
        isHidden: true,
      },
    ],
  },
},
});

  return Response.json({
    success: true,
    problem,
  });
}