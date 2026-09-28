import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `
You are an expert competitive programming mentor.

Your job is to analyze an accepted competitive programming submission.

Rules:
- Analyze the actual submitted code, not an imagined solution.
- Identify the algorithm and data structures actually used.
- Determine the time and space complexity from the actual implementation.
- Consider the given problem constraints when evaluating efficiency.
- Explain the submitted approach clearly and technically.
- Identify the most appropriate or optimal approach for the problem.
- Compare the submitted approach with the recommended approach.
- Do not invent weaknesses.
- If the submitted solution is already asymptotically optimal, explicitly state that.
- A different algorithm is not automatically better.
- Since the judge accepted the submission, do not claim that it is incorrect.
- Review code quality, readability, maintainability, and efficiency.
- Give specific and actionable recommendations.
- Ratings must be numbers from 0 to 10.
- Return only the requested JSON structure.
`;

const ANALYSIS_SCHEMA = {
  type: "object",

  properties: {
    approach: {
      type: "object",

      properties: {
        algorithm: {
          type: "string",
          description:
            "The algorithm and main data structures actually used in the submitted code.",
        },

        timeComplexity: {
          type: "string",
          description:
            "The time complexity of the submitted implementation.",
        },

        spaceComplexity: {
          type: "string",
          description:
            "The auxiliary space complexity of the submitted implementation.",
        },

        explanation: {
          type: "string",
          description:
            "A clear technical explanation of how the submitted solution works.",
        },

        strengths: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Specific strengths of the submitted approach.",
        },

        weaknesses: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Specific weaknesses or limitations of the submitted approach. Do not invent weaknesses.",
        },
      },

      required: [
        "algorithm",
        "timeComplexity",
        "spaceComplexity",
        "explanation",
        "strengths",
        "weaknesses",
      ],
    },

    bestApproach: {
      type: "object",

      properties: {
        algorithm: {
          type: "string",
          description:
            "The most appropriate or optimal algorithm for solving the problem.",
        },

        timeComplexity: {
          type: "string",
          description:
            "The time complexity of the recommended approach.",
        },

        spaceComplexity: {
          type: "string",
          description:
            "The auxiliary space complexity of the recommended approach.",
        },

        explanation: {
          type: "string",
          description:
            "A clear technical explanation of the recommended approach.",
        },

        comparison: {
          type: "string",
          description:
            "A comparison between the submitted approach and the recommended approach.",
        },
      },

      required: [
        "algorithm",
        "timeComplexity",
        "spaceComplexity",
        "explanation",
        "comparison",
      ],
    },

    codeReview: {
      type: "object",

      properties: {
        overall: {
          type: "number",
          description:
            "Overall code quality rating from 0 to 10.",
        },

        correctness: {
          type: "number",
          description:
            "Correctness rating from 0 to 10. The submission was accepted.",
        },

        efficiency: {
          type: "number",
          description:
            "Efficiency rating from 0 to 10.",
        },

        readability: {
          type: "number",
          description:
            "Readability rating from 0 to 10.",
        },

        maintainability: {
          type: "number",
          description:
            "Maintainability rating from 0 to 10.",
        },

        recommendations: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Specific and actionable recommendations for improving the code.",
        },
      },

      required: [
        "overall",
        "correctness",
        "efficiency",
        "readability",
        "maintainability",
        "recommendations",
      ],
    },
  },

  required: [
    "approach",
    "bestApproach",
    "codeReview",
  ],
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  let analysisId: number | null = null;

  try {
    // --------------------------------------------------
    // 1. Get submission ID
    // --------------------------------------------------

    const { submissionId } = await params;

    const id = Number(submissionId);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid submission ID",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2. Get submission + problem
    // --------------------------------------------------

    const submission = await prisma.submission.findUnique({
      where: {
        id,
      },

      include: {
        problem: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 3. Only analyze accepted submissions
    // --------------------------------------------------

    if (submission.verdict !== "AC") {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI analysis is available only for accepted submissions",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Check existing completed analysis
    // --------------------------------------------------

    const existingAnalysis =
      await prisma.aIAnalysis.findUnique({
        where: {
          submissionId: id,
        },
      });

    if (existingAnalysis?.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Analysis already exists",
        analysis: existingAnalysis,
      });
    }

    // --------------------------------------------------
    // 5. Create/update pending analysis
    // --------------------------------------------------

    const analysis = await prisma.aIAnalysis.upsert({
      where: {
        submissionId: id,
      },

      update: {
        status: "PENDING",
      },

      create: {
        submissionId: id,
        status: "PENDING",
      },
    });

    analysisId = analysis.id;

    // --------------------------------------------------
    // 6. Gemini configuration
    // --------------------------------------------------

    const apiKey = process.env.AI_ANALYSIS_API_KEY;

    const model =
      process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

    if (!apiKey) {
      throw new Error(
        "AI_ANALYSIS_API_KEY is not configured"
      );
    }

    // --------------------------------------------------
    // 7. Build prompt
    // --------------------------------------------------

    const prompt = `
Problem:

Title:
${submission.problem.title}

Statement:
${submission.problem.statement}

Constraints:
${submission.problem.constraints}

Time Limit:
${submission.problem.timeLimit} ms

Memory Limit:
${submission.problem.memoryLimit} MB


Submission:

Language:
${submission.language}

Execution Time:
${submission.executionTime ?? "Unknown"} ms

Memory Used:
${submission.memoryUsed ?? "Unknown"} KB

Code:
\`\`\`
${submission.code}
\`\`\`

The submission was accepted by the judge.

Analyze this exact submission according to the system instructions.
`;

    // --------------------------------------------------
    // 8. Prepare Gemini request
    // --------------------------------------------------

    const requestBody = {
      systemInstruction: {
        parts: [
          {
            text: SYSTEM_PROMPT,
          },
        ],
      },

      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],

      generationConfig: {
        maxOutputTokens: 2500,

        responseMimeType: "application/json",

        responseSchema: ANALYSIS_SCHEMA,

        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
    };

    // --------------------------------------------------
    // 9. Ask Gemini with retry
    // --------------------------------------------------

    let response: Response | null = null;

    const maxAttempts = 3;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },

          body: JSON.stringify(requestBody),
        }
      );

      // Success
      if (response.ok) {
        break;
      }

      // Read error body
      const errorText = await response.text();

      // Retry temporary/rate-limit errors
      if (
        (response.status === 503 ||
          response.status === 429) &&
        attempt < maxAttempts
      ) {
        const delay = Math.min(
          2000 * 2 ** (attempt - 1),
          8000
        );

        console.log(
          `Gemini returned ${response.status}. ` +
            `Retrying attempt ${
              attempt + 1
            }/${maxAttempts} in ${delay}ms...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );

        continue;
      }

      // No more retries
      throw new Error(
        `Gemini API returned ${response.status}: ${errorText}`
      );
    }

    if (!response || !response.ok) {
      throw new Error(
        "Gemini request failed after retries"
      );
    }

    // --------------------------------------------------
    // 10. Parse Gemini response
    // --------------------------------------------------

    const data = await response.json();

    const candidate = data.candidates?.[0];

    console.log(
      "Gemini finish reason:",
      candidate?.finishReason
    );

    // --------------------------------------------------
    // 11. Extract response text
    // --------------------------------------------------

    const content = candidate?.content?.parts
      ?.filter(
        (part: { text?: string }) =>
          typeof part.text === "string"
      )
      .map(
        (part: { text?: string }) => part.text!
      )
      .join("")
      .trim();

    if (!content) {
      console.error(
        "Gemini returned no text:",
        JSON.stringify(data, null, 2)
      );

      throw new Error(
        "Gemini returned an empty analysis"
      );
    }

    console.log(
      "Gemini raw analysis:",
      content
    );

    // --------------------------------------------------
    // 12. Parse JSON
    // --------------------------------------------------

    let result: any;

    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini JSON:",
        content
      );

      throw new Error(
        "Gemini returned invalid JSON"
      );
    }

    console.log(
      "Gemini parsed result:",
      JSON.stringify(result, null, 2)
    );

    // --------------------------------------------------
    // 13. Validate top-level structure
    // --------------------------------------------------

    if (
      !result ||
      typeof result !== "object" ||
      !result.approach ||
      !result.bestApproach ||
      !result.codeReview
    ) {
      console.error(
        "Invalid Gemini analysis structure:",
        JSON.stringify(result, null, 2)
      );

      throw new Error(
        "Gemini returned an invalid analysis structure"
      );
    }

    // --------------------------------------------------
    // 14. Validate approach
    // --------------------------------------------------

    if (
      typeof result.approach.algorithm !== "string" ||
      typeof result.approach.timeComplexity !==
        "string" ||
      typeof result.approach.spaceComplexity !==
        "string" ||
      typeof result.approach.explanation !==
        "string" ||
      !Array.isArray(result.approach.strengths) ||
      !Array.isArray(result.approach.weaknesses)
    ) {
      throw new Error(
        "Gemini returned an invalid approach structure"
      );
    }

    // --------------------------------------------------
    // 15. Validate recommended approach
    // --------------------------------------------------

    if (
      typeof result.bestApproach.algorithm !==
        "string" ||
      typeof result.bestApproach.timeComplexity !==
        "string" ||
      typeof result.bestApproach.spaceComplexity !==
        "string" ||
      typeof result.bestApproach.explanation !==
        "string" ||
      typeof result.bestApproach.comparison !==
        "string"
    ) {
      throw new Error(
        "Gemini returned an invalid recommended approach structure"
      );
    }

    // --------------------------------------------------
    // 16. Validate code review
    // --------------------------------------------------

    if (
      typeof result.codeReview.overall !==
        "number" ||
      typeof result.codeReview.correctness !==
        "number" ||
      typeof result.codeReview.efficiency !==
        "number" ||
      typeof result.codeReview.readability !==
        "number" ||
      typeof result.codeReview.maintainability !==
        "number" ||
      !Array.isArray(
        result.codeReview.recommendations
      )
    ) {
      throw new Error(
        "Gemini returned an invalid code review structure"
      );
    }

    // --------------------------------------------------
    // 17. Validate ratings
    // --------------------------------------------------

    const ratings = [
      result.codeReview.overall,
      result.codeReview.correctness,
      result.codeReview.efficiency,
      result.codeReview.readability,
      result.codeReview.maintainability,
    ];

    if (
      ratings.some(
        (rating: number) =>
          rating < 0 || rating > 10
      )
    ) {
      throw new Error(
        "Gemini returned ratings outside the 0-10 range"
      );
    }

    // --------------------------------------------------
    // 18. Save completed analysis
    // --------------------------------------------------

    const completedAnalysis =
      await prisma.aIAnalysis.update({
        where: {
          id: analysisId,
        },

        data: {
          status: "COMPLETED",

          approach: result.approach,

          bestApproach:
            result.bestApproach,

          codeReview:
            result.codeReview,
        },
      });

    // --------------------------------------------------
    // 19. Return completed analysis
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "AI analysis generated successfully",

      analysis: completedAnalysis,
    });
  } catch (error) {
    console.error(
      "AI analysis error:",
      error
    );

    let message =
      "Failed to generate AI analysis";

    if (error instanceof Error) {
      message = error.message;
    }

    // --------------------------------------------------
    // Mark analysis as failed
    // --------------------------------------------------

    if (analysisId !== null) {
      try {
        await prisma.aIAnalysis.update({
          where: {
            id: analysisId,
          },

          data: {
            status: "FAILED",
          },
        });
      } catch (updateError) {
        console.error(
          "Failed to update AI analysis status:",
          updateError
        );
      }
    }

    // --------------------------------------------------
    // Return actual error
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;

    const id = Number(submissionId);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid submission ID",
          received: submissionId,
        },
        { status: 400 }
      );
    }

    // Find cached analysis
    const analysis =
      await prisma.aIAnalysis.findUnique({
        where: {
          submissionId: id,
        },
      });

    // No analysis exists yet
    if (!analysis) {
      return NextResponse.json({
        success: true,
        exists: false,
        analysis: null,
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "AI analysis GET error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch AI analysis";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}