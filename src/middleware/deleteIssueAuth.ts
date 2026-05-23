import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import sendResponse from "../utility/sendResponse";

const deleteIssueAuth = (...roles: string[])=>{

    return async (req: Request, res: Response,next: NextFunction)=>{

        const token = req.headers.authorization;

        if(!token){
            return sendResponse(res, {
                statusCode: 401,
                success: false,
                message: "Unauthorized",
                error: "Invalid token"
            }) 
            
        }
        
        const decoded = jwt.verify(
            token,
            config.jwt_secret as string
        ) as JwtPayload

        const userData = await pool.query(`
            SELECT * FROM users WHERE id = $1
        `,[decoded.id]);

        if(userData.rows.length === 0) {
            return sendResponse(res, {
                statusCode: 401,
                success: false,
                message: "Unauthorized",
                error: "User not found"
            })
        }
       
        if(roles.length && userData.rows[0].role !== "maintainer") {
            return res.status(401).json({
                "success": false,
                "message": "Unauthorized",
                "error": "Access denied"
               })
        }
        const user = userData.rows[0];  
        req.user = user;
        next();
    }
}

export default deleteIssueAuth