"use client";

import { useState } from "react";

type TestResult = {
  verdict: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  executionTime: number;
  memoryUsed: number | null;
};

export default function CodePanel({
  problemId,
  contestId,
}: {
  problemId: number;
  contestId?: number;
}) {
  const [language, setLanguage] = useState("CPP");
  const [code, setCode] = useState("");

  const [runResults, setRunResults] =
    useState<TestResult[] | null>(null);

  const [submissionResults, setSubmissionResults] =
    useState<TestResult[] | null>(null);

  const [runCompileError, setRunCompileError] =
    useState<string | null>(null);

  const [submissionCompileError, setSubmissionCompileError] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [isRunning, setIsRunning] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * SUBMIT
   */
  const handleSubmit = async () => {
    setError(null);
    setSubmissionCompileError(null);
    setSubmissionResults(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId,
          contestId,
          language,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            `Submission failed (${response.status})`
        );
        return;
      }

      setSubmissionCompileError(
        data.compileError ?? null
      );

      const results: TestResult[] =
        data.results ?? [];

      setSubmissionResults(results);
    } catch (e) {
      setError("Failed to submit code.");
      setSubmissionResults(null);
      setSubmissionCompileError(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * RUN
   */
  const run = async () => {
    setError(null);
    setRunCompileError(null);
    setRunResults(null);
    setIsRunning(true);

    try {
      const response = await fetch(
        "/api/submissions/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problemId,
            language,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            `Run failed (${response.status})`
        );
        return;
      }

      setRunCompileError(
        data.compileError ?? null
      );

      const results: TestResult[] =
        data.results ?? [];

      setRunResults(results);
    } catch (e) {
      setError("Failed to run code.");
      setRunResults(null);
      setRunCompileError(null);
    } finally {
      setIsRunning(false);
    }
  };

  /*
   * DISPLAY RESULTS
   */
  const renderResults = (
    results: TestResult[],
    label: string,
    compileError?: string
  ) => {
    /*
     * COMPILATION ERROR
     */
    if (compileError) {
      return (
        <div className="rounded border border-red-600 bg-red-900/40 p-3 text-red-400 space-y-2">
          <div className="font-medium">
            ❌ {label}: Compilation Error
          </div>

          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
            {compileError}
          </pre>
        </div>
      );
    }

    /*
     * NO TEST CASES
     */
    if (!results || results.length === 0) {
      return (
        <div className="rounded border border-yellow-600 bg-yellow-900/40 p-3 text-yellow-400">
          ⚠️ {label}: No test cases were run
        </div>
      );
    }

    /*
     * ALL PASSED
     */
    const allPassed = results.every(
      (r) => r.verdict === "AC"
    );

    if (allPassed) {
      return (
        <div className="rounded border border-green-600 bg-green-900/40 p-3 text-green-400 font-medium">
          <div>
            ✅ {label}: Accepted
          </div>

          <div className="mt-1 text-sm">
            All {results.length} test case
            {results.length > 1 ? "s" : ""} passed
          </div>
        </div>
      );
    }

    /*
     * FIND FIRST FAILED TEST CASE
     */
    const failedTestCase = results.find(
      (r) => r.verdict !== "AC"
    );

    if (!failedTestCase) {
      return null;
    }

    const testCaseNumber =
      results.indexOf(failedTestCase) + 1;

    /*
     * TIME LIMIT EXCEEDED
     */
    if (failedTestCase.verdict === "TLE") {
      return (
        <div className="rounded border border-red-600 bg-red-900/40 p-3 text-red-400 space-y-2">
          <div className="font-medium">
            ❌ {label}: Time Limit Exceeded
          </div>

          <div className="text-sm text-gray-300">
            Test case {testCaseNumber}
          </div>

          {failedTestCase.executionTime != null && (
            <div className="text-sm text-gray-300">
              Execution time:{" "}
              {failedTestCase.executionTime.toFixed(2)} ms
            </div>
          )}
        </div>
      );
    }

    /*
     * MEMORY LIMIT EXCEEDED
     */
    if (failedTestCase.verdict === "MLE") {
      return (
        <div className="rounded border border-red-600 bg-red-900/40 p-3 text-red-400 space-y-2">
          <div className="font-medium">
            ❌ {label}: Memory Limit Exceeded
          </div>

          <div className="text-sm text-gray-300">
            Test case {testCaseNumber}
          </div>

          {failedTestCase.memoryUsed != null && (
            <div className="text-sm text-gray-300">
              Memory used:{" "}
              {failedTestCase.memoryUsed} KB
            </div>
          )}
        </div>
      );
    }

    /*
     * RUNTIME ERROR
     */
    if (failedTestCase.verdict === "RE") {
      return (
        <div className="rounded border border-red-600 bg-red-900/40 p-3 text-red-400 space-y-2">
          <div className="font-medium">
            ❌ {label}: Runtime Error
          </div>

          <div className="text-sm text-gray-300">
            Test case {testCaseNumber}
          </div>

          {failedTestCase.stderr && (
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
              {failedTestCase.stderr}
            </pre>
          )}
        </div>
      );
    }

    /*
     * WRONG ANSWER
     */
    if (failedTestCase.verdict === "WA") {
      return (
        <div className="rounded border border-red-600 bg-red-900/40 p-3 text-red-400 space-y-2">
          <div className="font-medium">
            ❌ {label}: Wrong Answer
          </div>

          <div className="text-sm text-gray-300">
            Test case {testCaseNumber}
          </div>

          <div className="space-y-1 font-mono text-sm text-gray-300">
            <div>
              <span className="text-gray-500">
                Input:
              </span>{" "}
              {failedTestCase.input}
            </div>

            <div>
              <span className="text-gray-500">
                Expected:
              </span>{" "}
              {failedTestCase.expectedOutput}
            </div>

            <div>
              <span className="text-gray-500">
                Got:
              </span>{" "}
              {failedTestCase.actualOutput}
            </div>

            {failedTestCase.stderr && (
              <div>
                <span className="text-gray-500">
                  Stderr:
                </span>{" "}
                {failedTestCase.stderr}
              </div>
            )}
          </div>
        </div>
      );
    }

    /*
     * FALLBACK
     */
    return (
      <div className="rounded border border-red-600 bg-red-900/40 p-3 text-red-400">
        ❌ {label}: {failedTestCase.verdict}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Language + actions */}
      <div className="flex items-center justify-between border-b border-gray-700 p-3">
        <select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
          className="rounded bg-gray-800 px-3 py-2 text-white"
        >
          <option value="CPP">
            C++
          </option>

          {/* <option value="JAVA">
            Java
          </option>

          <option value="PYTHON">
            Python
          </option>

          <option value="JAVASCRIPT">
            JavaScript
          </option> */}
        </select>

        <div className="flex gap-2">
          <button
            onClick={run}
            disabled={
              isRunning || isSubmitting
            }
            className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            {isRunning
              ? "Running..."
              : "Run"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              isRunning || isSubmitting
            }
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "Submitting..."
              : "Submit"}
          </button>
        </div>
      </div>

      {/* Code editor */}
      <textarea
        value={code}
        onChange={(e) =>
          setCode(e.target.value)
        }
        className="flex-1 resize-none bg-black p-4 font-mono text-sm text-white outline-none"
        placeholder="Write your code here..."
        spellCheck={false}
      />

      {/* Results */}
      <div className="max-h-64 space-y-3 overflow-y-auto border-t border-gray-700 p-3">
        {error && (
          <div className="text-sm text-red-400">
            {error}
          </div>
        )}

        {submissionResults && (
          renderResults(
            submissionResults,
            "Submission",
            submissionCompileError ??
              undefined
          )
        )}

        {runResults && (
          renderResults(
            runResults,
            "Run",
            runCompileError ??
              undefined
          )
        )}
      </div>
    </div>
  );
}