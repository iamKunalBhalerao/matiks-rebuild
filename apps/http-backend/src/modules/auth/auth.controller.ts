import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../middleware/error.middleware";
import { signInSchema, signUpSchema } from "@repo/common";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import { createToken } from "../../utils/jwt.utils";
import { httpConfig } from "../../config/auth.config";

export const signUpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      throw new ApiError("All Fields are required!", 400);

    const parsedData = signUpSchema.safeParse(req.body);
    if (!parsedData) throw new ApiError("Invalid Email or Password!", 400);

    const isUserExists = await prisma.user.findFirst({
      where: { email: email },
    });

    if (isUserExists)
      throw new ApiError("User with this email is already exists!", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    if (!user) throw new ApiError("Error while Signing Up!", 400);

    const token = await createToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    res
      .cookie("token", token, httpConfig)
      .status(200)
      .json({
        success: true,
        message: "Signed Up Successfully!",
        user: {
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const signInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw new ApiError("All fields are required!", 400);

    const parsedData = signInSchema.safeParse(req.body);
    if (!parsedData) throw new ApiError("Invalid Email or Password!", 400);

    const user = await prisma.user.findFirst({ where: { email: email } });
    if (!user) throw new ApiError("Invalid Email or Password!", 400);

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) throw new ApiError("Invalid Email or Password!", 400);

    const token = await createToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    res
      .cookie("token", token, httpConfig)
      .status(200)
      .json({
        success: true,
        message: "Signed In Successfully!",
        user: {
          id: user.id,
          username: user.username,
          emial: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const signOutController = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("token").status(200).json({
      success: true,
      message: "Signed Out Successfully!",
    });
  } catch (error) {
    next(error);
  }
};
