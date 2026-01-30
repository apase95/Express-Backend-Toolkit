import { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { getPaginationParams, getPagingData } from "../http/pagination.js";
import { created, ok } from "../http/response.js";
import { userService } from "../services/user.service.js";


export const getUsers: RequestHandler = asyncHandler(async(
    req: Request, 
    res: Response
) => {
  
    const { page, limit, skip } = getPaginationParams(req.query);
    const { users, total } = await userService.getUsers(skip, limit);

    const responseData = getPagingData(users, total, page, limit);
    return ok(res, responseData);
});

export const createUser: RequestHandler = asyncHandler(async (
    req: Request, 
    res: Response
) => {
    
    const newUser = await userService.createUser(req.body);
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
