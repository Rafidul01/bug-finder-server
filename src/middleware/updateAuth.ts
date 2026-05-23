import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const updateAuth = (...roles: string[])=>{

    return async (req: Request, res: Response,next: NextFunction)=>{

        const id = req.params.id as string;

        const token = req.headers.authorization;

        if(!token){
            return res.status(401).json({
                "success": false,
                "message": "Unauthorized???"
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
            return res.status(401).json({
                "success": false,
                "message": "Unauthorized||"
               })
        }
        
        if(roles.length && !roles.includes(userData.rows[0].role)){
            return res.status(401).json({
                "success": false,
                "message": "Unauthorized..."
               })
        }

        if(userData.rows[0].role == 'contributor' ) {
            const issueData = await pool.query(`
                SELECT * FROM issues WHERE id = $1
            `,[id]);

            if(issueData.rows.length === 0) {
                return res.status(401).json({
                    "success": false,
                    "message": "Unauthorized"
                   })
            }


            if(userData.rows[0].id !== issueData.rows[0].reporter_id || issueData.rows[0].status !== 'open') {
                return res.status(401).json({
                    "success": false,
                    "message": "Unauthorized"
                   })
            }

            const user = userData.rows[0];  
            req.user = user;
            next();
            return;
  
        }


        const user = userData.rows[0];  
        req.user = user;
        next();
    }
}

export default updateAuth