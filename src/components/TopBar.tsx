"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }


  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/me");
      setLoggedIn(res.ok);
    }
    console.log("checking auth");
    checkAuth();
  }, []);

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    setLoggedIn(false);

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b px-8 py-4">
      <Link href="/" className="text-2xl font-bold">
        CodeVector
      </Link>

      <nav className="flex items-center gap-6">
        <Link href="/problems">Problems</Link>
        <Link href="/contests">Contests</Link>

        {loggedIn ? (
          <>
            <Link href="/profile">Profile</Link>

            <button
              onClick={logout}
              className="rounded bg-red-600 px-4 py-2 text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}