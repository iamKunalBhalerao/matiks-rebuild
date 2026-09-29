import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { AuthUser } from "../types/express";
import { JWT_SECRET } from "../config/auth.config";

function isAuthUser(
  payload: string | JwtPayload,
): payload is JwtPayload & AuthUser {
  return (
    typeof payload === "object" &&
    typeof payload.id === "string" &&
    typeof payload.email === "string" &&
    typeof payload.username === "string"
  );
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isAuthUser(decoded)) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
}
