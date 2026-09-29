import { Router } from "express";
import {
  signInController,
  signOutController,
  signUpController,
} from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const authRouter: Router = Router();

authRouter.route("/signup").post(signUpController);
authRouter.route("/signin").post(signInController);
authRouter.route("/signout").post(signOutController);

export default authRouter;
