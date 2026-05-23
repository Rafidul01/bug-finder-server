import type { NextFunction, Request, Response } from "express";
import { issueService } from "./issues.service";
import type { IQuery } from "./issues.interface";
import sendResponse from "../../utility/sendResponse";

const cretateIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await issueService.createIssueIntoDB({
      ...req.body,
      ...req.user,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    })
  } catch (error) {
    next(error);
  }
};

const getAllIssues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sort = req.query.sort as "newest" | "oldest";
    const type = req.query.type as "bug" | "feature_request";
    const status = req.query.status as "open" | "in_progress" | "resolved";

    const result = await issueService.getAllIssuesFromDB({
      sort,
      type,
      status,
      
    });


    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues fetched successfully",
      data: result
    })
  } catch (error) {
    next(error);
  }
};

const getSingleIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await issueService.getSingleIssueFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result
    })

  } catch (error) {
    console.log(error);
    next(error);
    
  }
};

const updateIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await issueService.updateIssueIntoDB(id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    })

  } catch (error) {
    next(error);
  }
};
const deleteIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await issueService.deleteIssueFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    })

  } catch (error) {
    next(error);

  }
};

export const issueController = {
  cretateIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};
