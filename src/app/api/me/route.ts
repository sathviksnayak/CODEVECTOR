import { NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
    },
  });
}