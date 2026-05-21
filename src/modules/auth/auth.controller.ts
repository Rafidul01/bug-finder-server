import type { Request, Response } from "express";
import { pool } from "../../db";
import { authService } from "./auth.service";


const userRegister = async (req: Request, res: Response) => {
    try {
        const result = await authService.registerUserIntoDB(req.body);
        res.status(201).json({
            "success": true,
            "message": "User registered successfully",
            "data": result
           })
        
    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "User registration failed",
            "error": error
           })
        
    }
}

const userLogin = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body);

        
        res.status(200).json({
            "success": true,
            "message": "Login successful",
            "data": result
           })
        
    } catch (error) {
        res.status(400).json({
            "success": false,
            "message": "User login failed",
            "error": error
           })
        
    }
}


export const authController = {
    userRegister,
    userLogin
}