import jwt from "jsonwebtoken";
import { config } from "../config/index.config.js";


export interface TokenPayload {
    userId: string,
    role: string,
    sessionId?: string,
};

const getAccessTokenSecret = () => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("ACCESS_TOKEN_SECRET is note defined");
    return secret;
};

const getRefreshTokenSecret = () => {
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("REFRESH_TOKEN_SECRET is note defined");
    return secret;
};

export const signAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, getRefreshTokenSecret(), {
        expiresIn: config.jwt.accessExpiresIn as any //15m
    });
}

export const signRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, getRefreshTokenSecret(), {
        expiresIn: config.jwt.refreshExpiresIn as any //7d
    });
}

export const verifyToken = (
    token: string,
    isRefreshToken = false,
): TokenPayload => {

    const secret = isRefreshToken ? config.jwt.refreshSecret : config.jwt.accessSecret;        
    try {
        return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
        throw error;
    }
};
