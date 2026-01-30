import { Request, RequestHandler, Response } from "express";
import { config } from "../config/index.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { authService } from "../services/auth.service.js";
import { ok, created, noContent } from "../http/response.js";


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

export const logout: RequestHandler = ( 
    req: Request,
    res: Response
) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: config.app.env === "production",
        sameSite: "strict",
    });

    return ok(res, null, "Logged out successfully");
};

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
    const { signAccessToken, signRefreshToken } = await import("../security/jwt.js");
    
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.redirect(`${config.app.clientUrl}/oauth-success?token=${accessToken}`);
});