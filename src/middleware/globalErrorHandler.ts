import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utility/sendResponse";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;

  sendResponse(res, {
    statusCode,
    success: false,
    message: err.message || "Internal Server Error",
    error: err,
  });
};