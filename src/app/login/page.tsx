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
  }

  const isBanned = error === "Your account has been banned.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-700 bg-zinc-900 p-8 shadow-lg">

        <h1 className="mb-6 text-center text-3xl font-bold">
          Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="text"
            name="identifier"
            placeholder="Username or Email"
            value={form.identifier}
            onChange={handleChange}
            className="w-full rounded border border-gray-600 bg-zinc-800 p-2 text-white outline-none focus:border-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded border border-gray-600 bg-zinc-800 p-2 text-white outline-none focus:border-blue-500"
          />

          {error && (
            isBanned ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-lg text-red-400">
                    !
                  </div>

                  <div>
                    <p className="text-lg font-bold text-red-400">
                      Account Banned
                    </p>

                    <p className="mt-1 text-sm text-red-300/80">
                      Your account has been banned and
                      you cannot log in.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )
          )}

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-blue-400 hover:underline"
          >
            Register
          </a>
        </p>

      </div>
    </div>
  );
}