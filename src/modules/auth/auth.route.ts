import { Router, type Request, type Response } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post('/signup',authController.userRegister)

export const authRouter = router;