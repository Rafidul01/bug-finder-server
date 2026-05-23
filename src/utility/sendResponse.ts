import type { Response } from "express";

type TResponse<T> = {
    statusCode: number;
    success: boolean;
    message?: string;
    error?: any;
    data?: T;
    
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        error: data.error,
        data: data.data,
    });
};

export default sendResponse