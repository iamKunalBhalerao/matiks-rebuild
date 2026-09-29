import { Router } from "express";
import { getUserController, getUserProfileController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRouter: Router = Router();

userRouter.route("/me").get(authMiddleware, getUserController);
userRouter.route("/profile").get(authMiddleware, getUserProfileController);

export default userRouter;
