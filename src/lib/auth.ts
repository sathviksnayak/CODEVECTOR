import jwt from "jsonwebtoken";

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      username: string;
      email :string;
      role :string
    };
  } catch {
    return null;
  }
}