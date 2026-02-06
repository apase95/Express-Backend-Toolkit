import { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../core/middlewares/async-handler.middleware.js";
import { getPaginationParams, getPagingData } from "../../core/http/pagination.js";
import { created, ok } from "../../core/http/response.js";
import { userService } from "./user.service.js";
import { AppError } from "../../core/errors/AppError.js";


export const getMe: RequestHandler = asyncHandler(async(
    req: Request,
    res: Response
) => {
    
    return ok(res, req.user);
});


export const updateUserProfile: RequestHandler = asyncHandler(async(
    req: Request,
    res: Response
) => {
    
    const userId = req.user!._id.toString();
    const body = req.body;
    if (req.file) {
        body.avatarURL = req.file.path;
    }; 

    const updatedUser = await userService.updateUserProfile(userId, req.body);
    return ok(res, updatedUser, "Profile updated successfully");
});


export const changePhone: RequestHandler = asyncHandler(async(
    req: Request,
    res: Response
) => {

    const userId = req.user!._id.toString();
    
    const { phoneNumber } = req.body;
    if (!phoneNumber) throw new AppError("Phone number is required", 400);

    const updatedUser = await userService.changePhone(userId, phoneNumber);
    return ok(res, updatedUser, "Phone number updated successfully");
});


export const changePassword: RequestHandler = asyncHandler(async(
    req: Request,
    res: Response
) => {

    const userId = req.user!._id.toString();
    
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
        throw new AppError("New password must be at least 8 characters", 400);
    }

    await userService.changePassword(userId, { oldPassword, newPassword });
    return ok(res, null, "Password changed successfully");
});


export const createUser: RequestHandler = asyncHandler(async (
    req: Request, 
    res: Response
) => {
    
    const newUser = await userService.createUser(req.body);
    return created(res, newUser, "User registered successfully");
});

export const getUsers: RequestHandler = asyncHandler(async(
    req: Request, 
    res: Response
) => {
  
    const { page, limit } = getPaginationParams(req.query);
    const { keyword, role } = req.query;

    const { users, total } = await userService.getAllUsers({ 
        page, 
        limit, 
        keyword: keyword as string, 
        role: role as string 
    });

    const responseData = getPagingData(users, total, page, limit);
    return ok(res, responseData);
});

export const getUserById: RequestHandler = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    const { id } = req.params;
    const user = await userService.getUserById(id as string);
    return ok(res, user);
});

