import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: {
    default: "CodeVector",
    template: "%s | CodeVector",
  },
  description:
    "CodeVector is a competitive programming platform for solving problems, participating in contests, and submitting code.",
  keywords: [
    "competitive programming",
    "coding problems",
    "programming contests",
    "online judge",
  ],
  openGraph: {
    title: "CodeVector",
    description:
      "Solve programming problems, submit code, and compete in coding contests with CodeVector.",
    type: "website",
    siteName: "CodeVector",
  },
  twitter: {
    card: "summary",
    title: "CodeVector",
    description:
      "Solve programming problems, submit code, and compete in coding contests with CodeVector.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <TopBar />
        {children}
      </body>
    </html>
  );
}