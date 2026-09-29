import { prisma } from "@repo/db";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../middleware/error.middleware";

export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findFirst({
      where: { id: userId },
      omit: {
        password: true,
      },
    });
    if (!user) throw new ApiError("User not found!", 404);

    res.status(200).json({
      success: true,
      message: "User fetched successfully!",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findFirst({
      where: { id: userId },
      omit: {
        password: true,
      },
    });
    if (!user) throw new ApiError("User not found!", 404);

    const gamesPlayed = await prisma.gameMember.findMany({ where: { userId } });

    const userRating = await prisma.userRating.findFirst({ where: { userId } });

    const friendRequests = await prisma.friends.findMany({
      where: { reciverId: userId },
    });

    const friendRequestSent = await prisma.friends.findMany({
      where: { senderId: userId },
    });

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully!",
      user,
      gamesPlayed,
      userRating,
      friends: {
        friendRequests,
        friendRequestSent,
      },
    });
  } catch (error) {
    next(error);
  }
};
