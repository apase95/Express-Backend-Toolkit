import { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";
import { AppError } from "../errors/AppError.js";
import { cloudinaryUploader } from "../../storage/cloudinary.storage.js";


const handleUpload = (uploadFn: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        uploadFn(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(new AppError("File too large. Max limit is 10MB.", 400));
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return next(new AppError(`Unexpected field ${err.field}`, 400));
                }
                return next(new AppError(`Upload error: ${err.message}`, 400));
            } else if (err) {
                return next(new AppError(err.message || "Unknown upload error", 400));
            }            
            next();
        });
    };
};

export const upload = {
    single: (fieldName: string = "file"): RequestHandler => 
        handleUpload(cloudinaryUploader.single(fieldName)),
    
    array: (fieldName: string = "files", maxCount: number = 5): RequestHandler => 
        handleUpload(cloudinaryUploader.array(fieldName, maxCount))
    ,

    fields: (fields: multer.Field[]): RequestHandler => 
        handleUpload(cloudinaryUploader.fields(fields))
    ,
    
    none: (): RequestHandler => handleUpload(cloudinaryUploader.none())
};