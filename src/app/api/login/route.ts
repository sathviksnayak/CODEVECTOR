import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function validate(identifier: string, password: string) {
  const errors: {
    identifier?: string;
    password?: string;
  } = {};

  if (!identifier.trim()) {
    errors.identifier = "Username or Email is required.";
  }

  if (!password.trim()) {
    errors.password = "Password is required.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function POST(request: Request) {
  const { identifier, password } = await request.json();

  const validation = validate(identifier, password);

  if (!validation.valid) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
      ],
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  /*
   * Banned users cannot log in.
   */
  if (user.banned) {
    return NextResponse.json(
      {
        error:
          "Your account has been banned. You cannot log in.",
      },
      { status: 403 }
    );
  }

  const passwordMatches = await compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  const response = NextResponse.json(
    {
      message: "Login successful",
      userid: user.id,
    },
    { status: 200 }
  );

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}