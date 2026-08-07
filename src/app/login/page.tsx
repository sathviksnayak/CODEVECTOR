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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

    if (response.status === 400) {
      setError(Object.values(data.errors).join(" "));
    } else {
      setError(data.error);
    }
  }

return (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-full max-w-md rounded-lg border border-gray-700 p-8 bg-zinc-900 shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">
        Login
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="identifier"
          placeholder="Username or Email"
          value={form.identifier}
          onChange={handleChange}
          className="w-full rounded border border-gray-600 bg-zinc-800 p-2 text-white"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded border border-gray-600 bg-zinc-800 p-2 text-white"
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <a href="/register" className="text-blue-400 hover:underline">
          Register
        </a>
      </p>
    </div>
  </div>
);
}