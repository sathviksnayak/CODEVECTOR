import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // AI integration will go here.

    return NextResponse.json({
      message: "AI route is working",
    });
  } catch {
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}