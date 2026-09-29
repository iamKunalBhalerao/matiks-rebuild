import { Router } from "express";
import { getUserController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRouter: Router = Router();

userRouter.route("/me").get(authMiddleware, getUserController);

export default userRouter;
