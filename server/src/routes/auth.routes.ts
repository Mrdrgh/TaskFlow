import express, { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { resolve } from "path";
import { protect } from "../middleware/auth.middleware";

const authRouter: Router = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.get("/me", protect, getMe);

export default authRouter;