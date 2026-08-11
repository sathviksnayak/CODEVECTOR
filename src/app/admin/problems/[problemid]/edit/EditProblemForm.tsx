"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TestCase = {
  id?: number;
  input: string;
  output: string;
  isHidden: boolean;
};

type Problem = {
  id: number;
  title: string;
  statement: string;
  difficulty: string;
  example: string;
  constraints: string;
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
};

export default function EditProblemForm({
  problem,
}: {
  problem: Problem;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(problem.title);
  const [statement, setStatement] = useState(problem.statement);
  const [difficulty, setDifficulty] = useState(
    problem.difficulty
  );
  const [example, setExample] = useState(
    problem.example ?? ""
  );
  const [constraints, setConstraints] = useState(
    problem.constraints ?? ""
  );

  const [timeLimit, setTimeLimit] = useState(
    String(problem.timeLimit)
  );

  const [memoryLimit, setMemoryLimit] = useState(
    String(problem.memoryLimit)
  );

  const [testCases, setTestCases] = useState<TestCase[]>(
    problem.testCases.map((testCase) => ({
      id: testCase.id,
      input: testCase.input,
      output: testCase.output,
      isHidden: testCase.isHidden,
    }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function addTestCase() {
    setTestCases((prev) => [
      ...prev,
      {
        input: "",
        output: "",
        isHidden: false,
      },
    ]);
  }

  function removeTestCase(index: number) {
    setTestCases((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function updateTestCase(
    index: number,
    field: keyof TestCase,
    value: string | boolean
  ) {
    setTestCases((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (testCases.length === 0) {
      setError("Add at least one test case.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/problems/${problem.id}`,
        {
          method: "PUT",
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
          data.error || "Failed to update problem"
        );
        return;
      }

      setSuccess("Problem updated successfully.");

      router.refresh();

      setTimeout(() => {
        router.push("/admin/problems");
      }, 500);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Title
        </label>

        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Statement */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Problem Statement
        </label>

        <textarea
          value={statement}
          onChange={(e) =>
            setStatement(e.target.value)
          }
          className="min-h-40 w-full rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Difficulty
        </label>

        <select
          value={difficulty}
          onChange={(e) =>
            setDifficulty(e.target.value)
          }
          className="rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Example */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Example
        </label>

        <textarea
          value={example}
          onChange={(e) =>
            setExample(e.target.value)
          }
          className="min-h-32 w-full rounded-lg border border-gray-700 bg-gray-900 p-3 font-mono outline-none focus:border-blue-500"
        />
      </div>

      {/* Constraints */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Constraints
        </label>

        <textarea
          value={constraints}
          onChange={(e) =>
            setConstraints(e.target.value)
          }
          className="min-h-32 w-full rounded-lg border border-gray-700 bg-gray-900 p-3 font-mono outline-none focus:border-blue-500"
        />
      </div>

      {/* Limits */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Time Limit (ms)
          </label>

          <input
            type="number"
            min="100"
            value={timeLimit}
            onChange={(e) =>
              setTimeLimit(e.target.value)
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Memory Limit (MB)
          </label>

          <input
            type="number"
            min="16"
            value={memoryLimit}
            onChange={(e) =>
              setMemoryLimit(e.target.value)
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Test Cases */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Test Cases
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Existing test cases can be edited or removed.
            </p>
          </div>

          <button
            type="button"
            onClick={addTestCase}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
          >
            + Add Test Case
          </button>
        </div>

        <div className="space-y-4">
          {testCases.map((testCase, index) => (
            <div
              key={testCase.id ?? `new-${index}`}
              className="rounded-xl border border-gray-800 bg-gray-950 p-5"
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
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Input
                  </label>

                  <textarea
                    value={testCase.input}
                    onChange={(e) =>
                      updateTestCase(
                        index,
                        "input",
                        e.target.value
                      )
                    }
                    className="min-h-24 w-full rounded-lg border border-gray-700 bg-gray-900 p-3 font-mono outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Expected Output
                  </label>

                  <textarea
                    value={testCase.output}
                    onChange={(e) =>
                      updateTestCase(
                        index,
                        "output",
                        e.target.value
                      )
                    }
                    className="min-h-24 w-full rounded-lg border border-gray-700 bg-gray-900 p-3 font-mono outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-400">
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

      {/* Errors */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving Changes..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/admin/problems")
          }
          className="rounded-lg border border-gray-700 px-6 py-3 font-medium hover:bg-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}