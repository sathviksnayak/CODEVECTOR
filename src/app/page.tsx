import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="mx-auto flex min-h-[75vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
          Competitive Programming Platform
        </p>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
          Practice. Compete. Improve.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          Solve programming problems, submit your solutions, compete in
          contests, and track your performance on CodeVector.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/problems"
            className="rounded bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
          >
            Start Practicing
          </Link>

          <Link
            href="/contests"
            className="rounded border border-gray-700 px-6 py-3 font-semibold transition hover:bg-gray-900"
          >
            View Contests
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold">
            Everything you need to practice
          </h2>

          <p className="mt-3 max-w-2xl text-gray-400">
            A simple environment for solving problems and competing against
            other programmers.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Feature
              title="Problem Solving"
              description="Practice problems across different difficulties with test cases and execution limits."
            />

            <Feature
              title="Live Contests"
              description="Join timed programming contests and solve problems before the clock runs out."
            />

            <Feature
              title="Leaderboards"
              description="Track your contest performance and compare your results with other participants."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold">
            How it works
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              title="Choose a problem"
              description="Pick a problem based on its difficulty and start solving."
            />

            <Step
              number="02"
              title="Write and run code"
              description="Write your solution and run it against the available test cases."
            />

            <Step
              number="03"
              title="Submit"
              description="Submit your solution and receive a verdict based on the test results."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">
            Ready to solve?
          </h2>

          <p className="mt-3 text-gray-400">
            Start with a problem or join an upcoming contest.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/problems"
              className="rounded bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
            >
              Browse Problems
            </Link>

            <Link
              href="/contests"
              className="rounded border border-gray-700 px-6 py-3 font-semibold hover:bg-gray-900"
            >
              Browse Contests
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row">
          <p>© 2026 CodeVector</p>

          <div className="flex gap-6">
            <Link href="/problems" className="hover:text-white">
              Problems
            </Link>

            <Link href="/contests" className="hover:text-white">
              Contests
            </Link>

            <Link href="/login" className="hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 p-6">
      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-400">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-blue-500">
        {number}
      </p>

      <h3 className="mt-3 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-400">
        {description}
      </p>
    </div>
  );
}