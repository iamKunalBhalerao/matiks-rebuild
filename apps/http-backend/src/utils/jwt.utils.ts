import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.config";

export const createToken = async (data: {
  id: string;
  email: string;
  username: string;
}) => {
  return await jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = async (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
