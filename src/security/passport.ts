import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20"; 
import { config } from "../config/index.js";
import { authService } from "../services/auth.service.js";
import { logger } from "../logger/logger.js";
import passport from "passport";


passport.use(
    new GoogleStrategy(
        {
            clientID: config.oauth.google.clientId,
            clientSecret: config.oauth.google.clientSecret,
            callbackURL: config.oauth.google.callbackUrl,
        },
        async (accessToken, refreshToken, profile: Profile, done) => {
            try {
                const user = await authService.findOrCreateGoogleUser(profile);
                return done(null, user);
            } catch (error) {
                logger.error(`Google Auth Error: ${error}`);
                return done(error as Error, undefined);
            }
        }
    )
);

export default passport;