import jwt from "jsonwebtoken";


export interface TokenPayload {
    userId: string,
    role: string,
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
        expiresIn: "15m"
    });
}

export const signRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, getRefreshTokenSecret(), {
        expiresIn: "7d"
    });
}

export const verifyToken = (
    token: string,
    isRefreshToken = false,
): TokenPayload => {

    try {
        const secret = 
            isRefreshToken 
                ? getRefreshTokenSecret() 
                : getAccessTokenSecret();
                
        return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
        throw error;
    }
};
