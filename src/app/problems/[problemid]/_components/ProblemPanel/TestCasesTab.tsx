type TestCase = {
  id: number;
  input: string;
  output: string;
  isHidden: boolean;
};

export default function TestCasesTab({
  testCases,
}: {
  testCases: TestCase[];
}) {
  const visibleTestCases = testCases.filter(
    (tc) => !tc.isHidden
  );

  return (
    <div className="space-y-6">
      {visibleTestCases.map((tc, index) => (
        <div
          key={tc.id}
          className="rounded-lg border border-gray-800 bg-gray-950 p-5"
        >
          <h3 className="mb-5 text-lg font-semibold">
            Example {index + 1}
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-400">
                Input
              </h4>

              <pre className="overflow-x-auto rounded bg-black p-4 font-mono text-sm text-gray-200">
                {tc.input}
              </pre>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-400">
                Output
              </h4>

              <pre className="overflow-x-auto rounded bg-black p-4 font-mono text-sm text-gray-200">
                {tc.output}
              </pre>
            </div>
          </div>
        </div>
      ))}

      {visibleTestCases.length === 0 && (
        <p className="text-gray-500">
          No examples available.
        </p>
      )}
    </div>
  );
}