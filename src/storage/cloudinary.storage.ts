import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { config } from "../config/index.config.js";


cloudinary.config({
    cloud_name: config.cloudinary.name,
    api_key: config.cloudinary.key,
    api_secret: config.cloudinary.secret
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req: any, file: any) => {
        const base = file.originalname.split(".")[0].replace(/\s+/g, "-");
        
        return {
            folder: "express-toolkit-uploads",
            resource_type: "auto",
            public_id: `${Date.now()}-${base}`,
            allowed_formats: ["jpg", "png", "jpeg", "webp"] 
        };
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

export const cloudinaryUploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});