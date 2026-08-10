"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/me");
      setLoggedIn(res.ok);
    }

    console.log("checking auth");
    checkAuth();
  }, []);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    setLoggedIn(false);

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-gray-800 bg-gray-950 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white transition hover:text-blue-400"
        >
          CodeVector
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Link
            href="/problems"
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            Problems
          </Link>

          <Link
            href="/contests"
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            Contests
          </Link>

          {loggedIn ? (
            <>
              <Link
                href="/profile"
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                Profile
              </Link>

              <button
                onClick={logout}
                className="ml-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="ml-2 rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}