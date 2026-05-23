import type { Request, Response } from "express";
import { issueService } from "./issues.service";


const cretateIssue = async (req: Request, res: Response) => {
    try {
        const result = await issueService.createIssueIntoDB({...req.body, ...req.user});
        
        res.status(201).json({
            "success": true,
            "message": "Issue created successfully",
            "data": result
           })

        
    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "Issue creation failed",
            "error": error
           })
        
    }
}

export const issueController = {
    cretateIssue
}