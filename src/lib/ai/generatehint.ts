const SYSTEM_PROMPT = `
You are a competitive programming hint assistant.

Your job is to help a user understand why their solution may be wrong.

Rules:
- Give exactly ONE concise hint.
- Never repeat a previous hint.
- Never merely rephrase a previous hint.
- Give a different conceptual hint about the user's mistake.
- The hint must be a complete, self-contained sentence.
- Never return a sentence fragment.
- Never begin with words like "or", "and", "because", or "but".
- Do not provide the complete solution.
- Do not provide corrected code.
- Do not write replacement code.
- Do not directly reveal the answer.
- Do not reveal hidden test cases or expected outputs.
- Point the user toward the concept, logic, edge case, or assumption they should reconsider.
- Explicitly identify the relevant part of their logic to inspect.
- Base the hint on the provided problem and submitted code.
- Keep the hint short, ideally 1-3 sentences.
`;

interface GenerateHintParams {
  problem: string;
  constraints?: string;
  code: string;
  previousHints: string[];
}

export async function generateHint({
  problem,
  constraints,
  code,
  previousHints,
}: GenerateHintParams): Promise<string> {
  const apiKey =
    process.env.GENERATE_HINTS_API_KEY;

  const model =
    process.env.GEMINI_MODEL ??
    "gemini-3.6-flash";

  if (!apiKey) {
    throw new Error(
      "GENERATE_HINTS_API_KEY is not configured"
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },

      body: JSON.stringify({
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
                text: `
Problem:
${problem}

Constraints:
${constraints ?? "Not provided"}

User's submission:
\`\`\`cpp
${code}
\`\`\`

The submission received Wrong Answer.

Previous hints:
${previousHints.length > 0 ? previousHints.map((hint, index) => `${index + 1}. ${hint}`).join("\n") : "None"}

Give exactly one concise conceptual hint about a different aspect of the user's mistake. Do not repeat or merely rephrase any previous hint.
`,
              },
            ],
          },
        ],

        generationConfig: {
          maxOutputTokens: 300,
          thinkingConfig: {
            thinkingLevel: "minimal",
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gemini API returned ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const candidate = data.candidates?.[0];

  console.log(
    "Gemini finish reason:",
    candidate?.finishReason
  );

  const hint =
    candidate?.content?.parts
      ?.filter(
        (part: { text?: string }) =>
          typeof part.text === "string"
      )
      .map(
        (part: { text?: string }) => part.text!
      )
      .join("")
      .trim();

  if (!hint) {
    throw new Error(
      "Gemini returned an empty hint"
    );
  }

  return hint;
}