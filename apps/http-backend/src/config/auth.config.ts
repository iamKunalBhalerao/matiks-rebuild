export const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export const httpConfig = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
