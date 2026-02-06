import { signAccessToken, signRefreshToken, verifyToken } from '../../core/security/jwt.js';
import { sessionRepository } from "./session.repository.js";
import { config } from '../../core/config/index.config.js';
import ms, { StringValue } from "ms";
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../core/logger/logger.js';


class SessionService {
    async createSession(
        userId: string,
        role: string,
        userAgent?: string,
        ipAddress?: string,
    ) {
        const sessionId = new sessionRepository["model"].base.Types.ObjectId().toString();
        
        const refreshToken = signRefreshToken({ userId, role, sessionId });
        const accessToken = signAccessToken({ userId, role, sessionId });

        const refreshExpiresIn = config.jwt.refreshExpiresIn || "7d";
        const expireAt = new Date(Date.now() + ms(refreshExpiresIn as StringValue));

        await sessionRepository.create({
            _id: sessionId as any,
            userId: userId as any,
            refreshToken,
            userAgent: userAgent ?? null, 
            ipAddress: ipAddress ?? null,
            expireAt
        });

        return { accessToken, refreshToken };
    };

    async refreshSession(incomingRefreshToken: string) {
        let decoded;
        try {
            decoded = verifyToken(incomingRefreshToken, true);
        } catch (error) {
            throw new AppError("Invalid or expired refresh token", 401);
        }

        const { userId, role, sessionId } = decoded;

        const session = await sessionRepository.findById(sessionId!);
        if (!session) throw new AppError("Refresh token has been revoke or invalid", 403);
        if (session.refreshToken !== incomingRefreshToken) {
            await sessionRepository.deleteByUserId(sessionId!);
            logger.warn(`Reuse detection! Session ${sessionId} revoked for user ${userId}`);
            throw new AppError("Security alert: Token reuse detected. Please login again.", 403);
        }

        const newAccessToken = signAccessToken({ userId, role, sessionId: sessionId! });
        const newRefreshToken = signRefreshToken({ userId, role, sessionId: sessionId! });
        session.refreshToken = newRefreshToken;
        const refreshExpiresIn = config.jwt.refreshExpiresIn || "7d";
        session.expireAt = new Date(Date.now() + ms(refreshExpiresIn as StringValue));
        
        await session.save();
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    };

    async logout(refreshToken: string) {
        try {
            const decoded = verifyToken(refreshToken, true);
            await sessionRepository.deleteById(decoded.sessionId!);
        } catch (error) {};
    };

    async revokeAllSession(userId: string) {
        await sessionRepository.deleteByUserId(userId);
    };
};

export const sessionService = new SessionService();