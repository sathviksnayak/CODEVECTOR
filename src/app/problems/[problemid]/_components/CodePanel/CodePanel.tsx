"use client";

import {
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

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

  // AI hint state
  const [submissionId, setSubmissionId] =
    useState<number | null>(null);

  const [hints, setHints] =
    useState<string[]>([]);

  const [hintsUsed, setHintsUsed] =
    useState(0);

  const [hintsRemaining, setHintsRemaining] =
    useState(3);

  const [hintLimit, setHintLimit] =
    useState(3);

  const [isGettingHint, setIsGettingHint] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<"hints" | "results">("results");

  const [expandedHints, setExpandedHints] =
    useState<Set<number>>(new Set());

  useEffect(() => {
    if (contestId !== undefined) {
      const resetTab = window.setTimeout(
        () => setActiveTab("results"),
        0
      );

      return () => window.clearTimeout(resetTab);
    }

    const restoreHints = async () => {
      try {
        const response = await fetch(
          `/api/ai/hint?problemId=${problemId}`
        );

        if (!response.ok) return;

        const data = await response.json();
        setHints(data.hints ?? []);
        setHintsUsed(data.hintsUsed ?? 0);
        setHintsRemaining(data.hintsRemaining ?? 3);
        setHintLimit(data.hintLimit ?? 3);
      } catch {
        // Hint restoration is optional and should not block the problem page.
      }
    };

    restoreHints();
  }, [contestId, problemId]);

  /*
   * GET HINT
   */
  const getHint = async () => {
    if (!submissionId) return;

    setError(null);
    setIsGettingHint(true);

    try {
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            `Failed to get hint (${response.status})`
        );
        return;
      }

      setHints((prev) => [...prev, data.hint]);
      setHintsUsed((prev) => prev + 1);
      setHintsRemaining((prev) => Math.max(0, prev - 1));
      setActiveTab("hints");
    } catch {
      setError("Failed to get hint.");
    } finally {
      setIsGettingHint(false);
    }
  };

  /*
   * SUBMIT
   */
  const handleSubmit = async () => {
    setError(null);
    setSubmissionCompileError(null);
    setSubmissionResults(null);
    setSubmissionId(null);
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

      setSubmissionId(
        data.submissionId ?? null
      );

      setSubmissionCompileError(
        data.compileError ?? null
      );

      const results: TestResult[] =
        data.results ?? [];

      setSubmissionResults(results);
    } catch {
      setError("Failed to submit code.");
      setSubmissionResults(null);
      setSubmissionCompileError(null);
      setSubmissionId(null);
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
    } catch {
      setError("Failed to run code.");
      setRunResults(null);
      setRunCompileError(null);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleHint = (index: number) => {
    setExpandedHints((previous) => {
      const next = new Set(previous);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  const renderResultPanel = (
    header: string,
    details: ReactNode,
    className: string
  ) => {
    return (
      <div className={`${className} space-y-2 p-3`}>
        <div className="font-medium">
          {header}
        </div>
        {details}
      </div>
    );
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
      return renderResultPanel(
        `${label}: Compilation Error`,
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
          {compileError}
        </pre>,
        "rounded border border-red-600 bg-red-900/40 text-red-400"
      );
    }

    /*
     * NO TEST CASES
     */
    if (!results || results.length === 0) {
      return renderResultPanel(
        `⚠️ ${label}: No test cases were run`,
        null,
        "rounded border border-yellow-600 bg-yellow-900/40 text-yellow-400"
      );
    }

    /*
     * ALL PASSED
     */
    const allPassed = results.every(
      (r) => r.verdict === "AC"
    );

    if (allPassed) {
      return renderResultPanel(
        `${label}: Accepted`,
        <div className="text-sm">
          All {results.length} test case
          {results.length > 1 ? "s" : ""} passed
        </div>,
        "rounded border border-green-600 bg-green-900/40 text-green-400"
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
      return renderResultPanel(
        `${label}: Time Limit Exceeded`,
        <>
          <div className="text-sm text-gray-300">
            Test case {testCaseNumber}
          </div>

          {failedTestCase.executionTime != null && (
            <div className="text-sm text-gray-300">
              Execution time:{" "}
              {failedTestCase.executionTime.toFixed(2)} ms
            </div>
          )}
        </>,
        "rounded border border-red-600 bg-red-900/40 text-red-400"
      );
    }

    /*
     * MEMORY LIMIT EXCEEDED
     */
    if (failedTestCase.verdict === "MLE") {
      return renderResultPanel(
        `❌ ${label}: Memory Limit Exceeded`,
        <>
          <div className="text-sm text-gray-300">
            Test case {testCaseNumber}
          </div>

          {failedTestCase.memoryUsed != null && (
            <div className="text-sm text-gray-300">
              Memory used:{" "}
              {failedTestCase.memoryUsed} KB
            </div>
          )}
        </>,
        "rounded border border-red-600 bg-red-900/40 text-red-400"
      );
    }

    /*
     * RUNTIME ERROR
     */
    if (failedTestCase.verdict === "RE") {
      return renderResultPanel(
        `❌ ${label}: Runtime Error`,
        <>
          <div className="text-sm text-gray-300">
            Test case {testCaseNumber}
          </div>

          {failedTestCase.stderr && (
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
              {failedTestCase.stderr}
            </pre>
          )}
        </>,
        "rounded border border-red-600 bg-red-900/40 text-red-400"
      );
    }

    /*
     * WRONG ANSWER
     */
    if (failedTestCase.verdict === "WA") {
      return renderResultPanel(
        `${label}: Wrong Answer`,
        <>
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
        </>,
        "rounded border border-red-600 bg-red-900/40 text-red-400"
      );
    }

    /*
     * FALLBACK
     */
    return renderResultPanel(
      `${label}: ${failedTestCase.verdict}`,
      null,
      "rounded border border-red-600 bg-red-900/40 text-red-400"
    );
  };

  const hasWrongAnswer =
    submissionResults?.some(
      (r) => r.verdict === "WA"
    ) ?? false;

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
          {/* Get Hint */}
          {hasWrongAnswer &&
            contestId === undefined && (
              hintsRemaining > 0 ? (
                <button
                  onClick={getHint}
                  disabled={
                    isGettingHint ||
                    isRunning ||
                    isSubmitting ||
                    !submissionId
                  }
                  title={`${hintsRemaining} hints remaining (${hintsUsed} used)`}
                  className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isGettingHint
                    ? "Getting Hint..."
                    : "Get Hint"}
                </button>
              ) : (
                <span className="rounded bg-gray-800 px-3 py-2 text-sm text-gray-400">
                  💡 Hint limit reached ({hintLimit - hintsRemaining}/{hintLimit})
                </span>
              )
            )}

          {/* Run */}
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

          {/* Submit */}
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
        <div
          className="flex border-b border-gray-700"
          role="tablist"
        >
          {contestId === undefined && (
            <button
              type="button"
              role="tab"
              onClick={() => setActiveTab("hints")}
              className={`flex-1 border-b-2 px-3 py-2 text-sm font-medium ${
                activeTab === "hints"
                  ? "border-purple-400 text-purple-200"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
              aria-selected={activeTab === "hints"}
            >
              💡 Hints
            </button>
          )}

          <button
            type="button"
            role="tab"
            onClick={() => setActiveTab("results")}
            className={`flex-1 border-b-2 px-3 py-2 text-sm font-medium ${
              activeTab === "results"
                ? "border-blue-400 text-blue-200"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
            aria-selected={activeTab === "results"}
          >
            🧪 Results
          </button>
        </div>

        {activeTab === "hints" && contestId === undefined ? (
          <>
            {hints.map((hint, index) => {
              const isExpanded = expandedHints.has(index);

              return (
                <div
                  key={`${index}-${hint}`}
                  className="rounded border border-purple-600 bg-purple-900/30 text-purple-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleHint(index)}
                    className="flex w-full items-center justify-between p-3 text-left font-medium"
                    aria-expanded={isExpanded}
                  >
                    <span>Hint {index + 1}</span>
                    <span aria-hidden="true">
                      {isExpanded ? "⌃" : "⌄"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 text-sm">
                      {hint}
                    </div>
                  )}
                </div>
              );
            })}

            {hintsRemaining === 0 ? (
              <div className="text-sm text-gray-400">
                Hint limit reached ({hintLimit - hintsRemaining}/{hintLimit})
              </div>
            ) : hints.length === 0 ? (
              <div className="text-sm text-gray-400">
                No hints generated yet.
              </div>
            ) : null}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}