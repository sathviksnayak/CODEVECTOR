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
  return (
    <div>
      {testCases
        .filter((tc) => !tc.isHidden)
        .map((tc) => (
          <div key={tc.id}>
            <h3>Example {tc.id}</h3>

            <h4>Input</h4>
            <pre>{tc.input}</pre>

            <h4>Output</h4>
            <pre>{tc.output}</pre>
          </div>
        ))}
    </div>
  );
}