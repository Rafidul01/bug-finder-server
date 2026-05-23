import type { Request, Response } from "express";
import { issueService } from "./issues.service";
import type { IQuery } from "./issues.interface";


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

const getAllIssues = async (req: Request, res: Response) => {
    try {
        
        const sort   = req.query.sort as 'newest' | 'oldest';
        const type = req.query.type as 'bug' | 'feature_request';
        const status = req.query.status as 'open' | 'in_progress' | 'resolved';

        const result = await issueService.getAllIssuesFromDB({sort,type,status});

        

        

        res.status(200).json({
            "success": true,
            "message": "Issues fetched successfully",
            "data": result
           })
        
    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "Issue fetching failed",
            "error": error
           })
        
    }
}

export const issueController = {
    cretateIssue,
    getAllIssues
}