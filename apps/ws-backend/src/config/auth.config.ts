import type { JwtPayload } from "jsonwebtoken";
import type { AuthUser } from "../types/types";

export const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export function isAuthUser(
  payload: string | JwtPayload,
): payload is JwtPayload & AuthUser {
  return (
    typeof payload === "object" &&
    typeof payload.id === "string" &&
    typeof payload.email === "string" &&
    typeof payload.username === "string"
  );
}
