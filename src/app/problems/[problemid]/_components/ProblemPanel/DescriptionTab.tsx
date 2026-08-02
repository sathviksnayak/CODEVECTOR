type Problem = {
  title: string;
  difficulty: string;
  statement: string;
  example: string;
  constraints: string;
  timeLimit: number;
  memoryLimit: number;
};

export default function DescriptionTab({
  data,
}: {
  data: Problem;
}) {
  return (
    <div>
      <h1>{data.title}</h1>

      <p>{data.difficulty}</p>

      <section>
        <h2>Description</h2>
        <p>{data.statement}</p>
      </section>

      <section>
        <h2>Example</h2>
        <pre>{data.example}</pre>
      </section>

      <section>
        <h2>Constraints</h2>
        <pre>{data.constraints}</pre>
      </section>

      <section>
        <p>Time Limit: {data.timeLimit} ms</p>
        <p>Memory Limit: {data.memoryLimit} MB</p>
      </section>
    </div>
  );
}