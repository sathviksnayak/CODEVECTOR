"use client";

import { useEffect, useState } from "react";

type Approach = {
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  strengths: string[];
  weaknesses: string[];
};

type BestApproach = {
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  comparison: string;
};

type CodeReview = {
  overall: number;
  correctness: number;
  efficiency: number;
  readability: number;
  maintainability: number;
  recommendations: string[];
};

type AIAnalysis = {
  id: number;
  submissionId: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  approach: Approach | null;
  bestApproach: BestApproach | null;
  codeReview: CodeReview | null;
};

type AIAnalysisTabProps = {
  submissionId: number | null;
};

export default function AIAnalysisTab({
  submissionId,
}: AIAnalysisTabProps) {
  const [analysis, setAnalysis] =
    useState<AIAnalysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) {
      setAnalysis(null);
      setError(null);
      return;
    }

    fetchAnalysis(submissionId);
  }, [submissionId]);

  async function fetchAnalysis(id: number) {
    try {
      setLoading(true);
      setError(null);

      // First check whether an analysis already exists
      const response = await fetch(
        `/api/submissions/${id}/analysis`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch analysis"
        );
      }

      if (data.exists) {
        // Analysis already completed
        if (data.analysis.status === "COMPLETED") {
          setAnalysis(data.analysis);
          return;
        }

        // Analysis is currently pending
        if (data.analysis.status === "PENDING") {
          setAnalysis(data.analysis);
          return;
        }

        // Previous attempt failed, so generate it again
        if (data.analysis.status === "FAILED") {
          await generateAnalysis(id);
          return;
        }
      }

      // No analysis exists, generate one
      await generateAnalysis(id);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateAnalysis(id: number) {
    const response = await fetch(
      `/api/submissions/${id}/analysis`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to generate analysis"
      );
    }

    setAnalysis(data.analysis);
  }

  if (!submissionId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">
            AI Analysis
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Select an accepted submission to analyze it.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />

          <h2 className="mt-4 text-lg font-semibold text-white">
            Analyzing submission...
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Gemini is analyzing your solution.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <div className="max-w-xl text-center">
          <h2 className="text-2xl font-bold text-red-400">
            Analysis failed
          </h2>

          <p className="mt-3 break-words text-sm text-gray-400">
            {error}
          </p>

          <button
            onClick={() => {
              if (submissionId) {
                fetchAnalysis(submissionId);
              }
            }}
            className="mt-6 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  if (analysis.status === "PENDING") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">
            Analysis in progress
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your submission is being analyzed.
          </p>
        </div>
      </div>
    );
  }

  if (analysis.status === "FAILED") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-400">
            Analysis failed
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            The previous analysis attempt failed. Try again.
          </p>

          <button
            onClick={() => fetchAnalysis(submissionId)}
            className="mt-5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const approach = analysis.approach;
  const bestApproach = analysis.bestApproach;
  const codeReview = analysis.codeReview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500">
          AI Analysis
        </p>

        <div className="mt-1 flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">
            Submission #{submissionId}
          </h2>

          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
            AC
          </span>
        </div>
      </div>

      {/* Your Approach */}
      {approach && (
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          <h3 className="text-lg font-semibold text-white">
            Your Approach
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <InfoCard
              label="Algorithm"
              value={approach.algorithm}
            />

            <InfoCard
              label="Time Complexity"
              value={approach.timeComplexity}
            />

            <InfoCard
              label="Space Complexity"
              value={approach.spaceComplexity}
            />
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300">
              How it works
            </h4>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-400">
              {approach.explanation}
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-green-400">
                Strengths
              </h4>

              <ul className="mt-3 space-y-2">
                {approach.strengths?.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-400"
                    >
                      • {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-yellow-400">
                Weaknesses
              </h4>

              <ul className="mt-3 space-y-2">
                {approach.weaknesses?.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-400"
                    >
                      • {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Recommended Approach */}
      {bestApproach && (
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          <h3 className="text-lg font-semibold text-white">
            Recommended Approach
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <InfoCard
              label="Algorithm"
              value={bestApproach.algorithm}
            />

            <InfoCard
              label="Time Complexity"
              value={bestApproach.timeComplexity}
            />

            <InfoCard
              label="Space Complexity"
              value={bestApproach.spaceComplexity}
            />
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300">
              Explanation
            </h4>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-400">
              {bestApproach.explanation}
            </p>
          </div>

          <div className="mt-6 rounded-md border border-blue-500/20 bg-blue-500/5 p-4">
            <h4 className="text-sm font-medium text-blue-400">
              Compared with your approach
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              {bestApproach.comparison}
            </p>
          </div>
        </section>
      )}

      {/* Code Review */}
      {codeReview && (
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Code Review
            </h3>

            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {codeReview.overall}/10
              </div>

              <p className="text-xs text-gray-500">
                Overall
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Rating
              label="Correctness"
              value={codeReview.correctness}
            />

            <Rating
              label="Efficiency"
              value={codeReview.efficiency}
            />

            <Rating
              label="Readability"
              value={codeReview.readability}
            />

            <Rating
              label="Maintainability"
              value={codeReview.maintainability}
            />
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300">
              Recommendations
            </h4>

            <ul className="mt-3 space-y-3">
              {codeReview.recommendations?.map(
                (recommendation, index) => (
                  <li
                    key={index}
                    className="rounded-md border border-gray-800 bg-gray-900 px-4 py-3 text-sm leading-6 text-gray-400"
                  >
                    {recommendation}
                  </li>
                )
              )}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

/* ----------------------------- */
/* Small UI Components            */
/* ----------------------------- */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-200">
        {value}
      </p>
    </div>
  );
}

function Rating({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}/10
      </p>
    </div>
  );
}