"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setGeneralError("");

    setError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError({
      name: "",
      email: "",
      password: "",
    });

    setGeneralError("");
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.status === 201) {
        router.push("/login");
        return;
      }

      if (response.status === 409) {
        setGeneralError(
          "An account with this username or email already exists."
        );
        return;
      }

      if (response.status === 400) {
        if (data.error) {
          setError(data.error);
        } else {
          setGeneralError("Please check your information.");
        }

        return;
      }

      setGeneralError(
        data.error || "Something went wrong. Please try again."
      );
    } catch {
      setGeneralError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#111827_0%,#000_45%)] px-6 py-12 text-white">
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950/90 p-8 shadow-2xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold text-blue-400">
              CodeVector
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Join CodeVector and start solving problems.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />

              {error.name && (
                <p className="mt-2 text-sm text-red-400">
                  {error.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />

              {error.email && (
                <p className="mt-2 text-sm text-red-400">
                  {error.email}
                </p>
              )}
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
                name="password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />

              {error.password && (
                <p className="mt-2 text-sm text-red-400">
                  {error.password}
                </p>
              )}
            </div>

            {/* General Error */}
            {generalError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {generalError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}