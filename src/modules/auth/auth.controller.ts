import type { Request, Response } from "express";
import { pool } from "../../db";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const userRegister = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUserIntoDB(req.body);
    
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result
    })
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "User registration failed",
      error: error
    })
  }
};

const userLogin = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User login successful",
      data: result,
    });
  } catch (error) {
    
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "User login failed",
      error: error,
    })
  }
};

export const authController = {
  userRegister,
  userLogin,
};
