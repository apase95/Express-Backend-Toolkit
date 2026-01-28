import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { getPaginationParams, getPagingData } from "../http/pagination.js";
import { created, ok } from "../http/response.js";
import User from "../models/User.js";

export const getUsers = asyncHandler(async (
    req: Request, 
    res: Response
) => {
  
    const { page, limit, skip } = getPaginationParams(req.query);
    const [users, total] = await Promise.all([
        User.find().skip(skip).limit(limit),
        User.countDocuments()
    ]);

    const responseData = getPagingData(users, total, page, limit);
    return ok(res, responseData);
});

export const createUser = asyncHandler(async (
    req: Request, 
    res: Response
) => {
    
    const newUser = await User.create(req.body);
    return created(res, newUser, "User registered successfully");
});

/*
export const authMe = async(req, res) => {
    return;
};

export const updateUserProfile = async (req, res) => {
    return;
};

export const changePhone = async (req, res) => {
    return;
};
*/
