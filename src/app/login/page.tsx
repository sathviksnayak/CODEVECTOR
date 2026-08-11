"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/profile");
        return;
      }

      if (response.status === 403) {
        setError("Your account has been banned.");
        return;
      }

      if (response.status === 400) {
        setError(
          Object.values(data.errors).join(" ")
        );
        return;
      }

      setError(
        data.error || "Invalid credentials"
      );
    } catch {
      setError("Unable to connect to the server.");
    }
  }

  const isBanned =
    error === "Your account has been banned.";

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center justify-center">

        <div className="w-full">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue to CodeVector
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8 shadow-2xl">

            {/* Banned message */}
            {isBanned && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-6">

                <div className="mb-4 flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/20 text-xl font-bold text-red-400">
                    !
                  </div>

                  <div>
                    <p className="text-xl font-bold text-red-400">
                      Account Banned
                    </p>

                    <p className="mt-1 text-sm text-red-300/70">
                      Access to CodeVector has been
                      restricted.
                    </p>
                  </div>

                </div>

                <div className="border-t border-red-500/20 pt-4">
                  <p className="text-sm leading-relaxed text-gray-400">
                    Your account has been banned and
                    you cannot log in at this time.
                  </p>
                </div>

              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Username / Email */}
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Username or Email
                </label>

                <input
                  id="identifier"
                  type="text"
                  name="identifier"
                  placeholder="Enter your username or email"
                  value={form.identifier}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoComplete="current-password"
                />
              </div>

              {/* Normal error */}
              {error && !isBanned && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-sm text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                Login
              </button>

            </form>

            {/* Register */}
            <div className="mt-7 border-t border-gray-800 pt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="font-medium text-blue-400 transition hover:text-blue-300 hover:underline"
                >
                  Create one
                </a>
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}