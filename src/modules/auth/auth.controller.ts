import { Request, RequestHandler, Response } from "express";
import { config } from "../../core/config/index.config.js";
import { asyncHandler } from "../../core/middlewares/async-handler.middleware.js";
import { authService } from "./auth.service.js";
import { ok, created } from "../../core/http/response.js";
import { AppError } from "../../core/errors/AppError.js";
import { sessionService } from "../session/session.service.js";


const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: config.app.env === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};


export const register: RequestHandler = asyncHandler(async(
    req: Request,
    res: Response
) => {
    const newUser = await authService.register(req.body);
    return created(res, newUser, "User registered successfully");
});


export const login: RequestHandler = asyncHandler(async(
    req: Request,
    res: Response
) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    return ok(res, { user, accessToken }, "Login successfully");
});


export const logout: RequestHandler = asyncHandler(async(
    req: Request,
    res: Response
) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        await sessionService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", { ...COOKIE_OPTIONS, maxAge: 0 });
    return ok(res, null, "Logged out successfully");
});


export const refreshToken: RequestHandler = asyncHandler(async(
    req: Request,
    res: Response
) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        return res.status(401).json({ success: false, message: "NO refresh token provider"});
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(token);
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    return ok(res, { accessToken }, "Token refreshed");
});


export const getMe: RequestHandler = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    return ok(res, req.user);
});


export const googleCallback: RequestHandler = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    if (!req.user) {
        return res.redirect(`${config.app.clientUrl}/login?error=auth_failed`);
    }

    const user = req.user as any; 
    const { signAccessToken, signRefreshToken } = await import("../../core/security/jwt.js");
    
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.redirect(`${config.app.clientUrl}/oauth-success?token=${accessToken}`);
});


export const linkedinCallback: RequestHandler = asyncHandler(async(
    req: Request, 
    res: Response
) => {
    if (!req.user) {
        return res.redirect(`${config.app.clientUrl}/login?error=auth_failed`);
    }

    const user = req.user as any; 
    const { signAccessToken, signRefreshToken } = await import("../../core/security/jwt.js");
    
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.redirect(`${config.app.clientUrl}/oauth-success?token=${accessToken}`);
});


export const verifyEmail: RequestHandler = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) throw new AppError("Token is required", 400);
    
    const result = await authService.verifyEmail(token);
    return ok(res, result);
});


export const forgotPassword: RequestHandler = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new AppError("Email is required", 400);

    await authService.forgotPassword(email);
    return ok(res, null, "If your email exists, a reset link has been sent.");
});


export const resetPassword: RequestHandler = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new AppError("Token and new password are required", 400);

    const result = await authService.resetPassword(token, newPassword);
    return ok(res, result);
});