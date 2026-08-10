"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TestCase = {
  input: string;
  output: string;
  isHidden: boolean;
};

export default function CreateProblemPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [example, setExample] = useState("");
  const [constraints, setConstraints] = useState("");
  const [timeLimit, setTimeLimit] = useState("1000");
  const [memoryLimit, setMemoryLimit] = useState("256");

  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      input: "",
      output: "",
      isHidden: false,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addTestCase() {
    setTestCases([
      ...testCases,
      {
        input: "",
        output: "",
        isHidden: false,
      },
    ]);
  }

  function removeTestCase(index: number) {
    setTestCases(
      testCases.filter((_, i) => i !== index)
    );
  }

  function updateTestCase(
    index: number,
    field: keyof TestCase,
    value: string | boolean
  ) {
    const updated = [...testCases];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setTestCases(updated);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/problems",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            statement,
            difficulty,
            example,
            constraints,
            timeLimit: Number(timeLimit),
            memoryLimit: Number(memoryLimit),
            testCases,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to create problem"
        );
        return;
      }

      router.push("/admin/problems");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-8 text-white">
      <h1 className="text-3xl font-bold">
        Create Problem
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="mb-2 block">
            Title
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full rounded border border-gray-700 bg-gray-900 p-3"
            placeholder="Two Sum"
            required
          />
        </div>

        {/* Statement */}
        <div>
          <label className="mb-2 block">
            Problem Statement
          </label>

          <textarea
            value={statement}
            onChange={(e) =>
              setStatement(e.target.value)
            }
            className="min-h-40 w-full rounded border border-gray-700 bg-gray-900 p-3"
            placeholder="Given an array..."
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="mb-2 block">
            Difficulty
          </label>

          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value)
            }
            className="rounded border border-gray-700 bg-gray-900 p-3"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">
              Medium
            </option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Example */}
        <div>
          <label className="mb-2 block">
            Example
          </label>

          <textarea
            value={example}
            onChange={(e) =>
              setExample(e.target.value)
            }
            className="min-h-32 w-full rounded border border-gray-700 bg-gray-900 p-3 font-mono"
            placeholder={`Input: nums=[2,7,11,15], target=9
Output: 0 1`}
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="mb-2 block">
            Constraints
          </label>

          <textarea
            value={constraints}
            onChange={(e) =>
              setConstraints(e.target.value)
            }
            className="min-h-32 w-full rounded border border-gray-700 bg-gray-900 p-3 font-mono"
            placeholder={`2 <= n <= 10^4
-10^9 <= nums[i] <= 10^9`}
          />
        </div>

        {/* Limits */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block">
              Time Limit (ms)
            </label>

            <input
              type="number"
              value={timeLimit}
              onChange={(e) =>
                setTimeLimit(e.target.value)
              }
              className="w-full rounded border border-gray-700 bg-gray-900 p-3"
              min="100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block">
              Memory Limit (MB)
            </label>

            <input
              type="number"
              value={memoryLimit}
              onChange={(e) =>
                setMemoryLimit(e.target.value)
              }
              className="w-full rounded border border-gray-700 bg-gray-900 p-3"
              min="16"
              required
            />
          </div>
        </div>

        {/* Test Cases */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Test Cases
            </h2>

            <button
              type="button"
              onClick={addTestCase}
              className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
            >
              + Add Test Case
            </button>
          </div>

          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <div
                key={index}
                className="rounded border border-gray-700 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">
                    Test Case {index + 1}
                  </h3>

                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeTestCase(index)
                      }
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <textarea
                    value={testCase.input}
                    onChange={(e) =>
                      updateTestCase(
                        index,
                        "input",
                        e.target.value
                      )
                    }
                    className="min-h-24 w-full rounded border border-gray-700 bg-gray-900 p-3 font-mono"
                    placeholder="Input"
                    required
                  />

                  <textarea
                    value={testCase.output}
                    onChange={(e) =>
                      updateTestCase(
                        index,
                        "output",
                        e.target.value
                      )
                    }
                    className="min-h-24 w-full rounded border border-gray-700 bg-gray-900 p-3 font-mono"
                    placeholder="Expected Output"
                    required
                  />

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={testCase.isHidden}
                      onChange={(e) =>
                        updateTestCase(
                          index,
                          "isHidden",
                          e.target.checked
                        )
                      }
                    />

                    Hidden test case
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-600 bg-red-900/30 p-3 text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Problem"}
        </button>
      </form>
    </div>
  );
}