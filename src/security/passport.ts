import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20"; 
import { Strategy as LinkedInStrategy, Profile as LinkedInProfile } from "passport-linkedin-oauth2";
import { config } from "../config/index.config.js";
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
        async (
            accessToken: string, 
            refreshToken: string, 
            profile: Profile, 
            done: (error: any, user?: any) => void
        ) => {
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

passport.use(
    new LinkedInStrategy(
        {
            clientID: config.oauth.linkedin.clientId,
            clientSecret: config.oauth.linkedin.clientSecret,
            callbackURL: config.oauth.linkedin.callbackUrl,
            scope: ['r_emailaddress', 'r_liteprofile'],
        },
        async (
            accessToken: string, 
            refreshToken: string, 
            profile: LinkedInProfile, 
            done: (error: any, user?: any) => void
        ) => {
            try {
                const user = await authService.findOrCreateLinkedInUser(profile as any);
                return done(null, user);
            } catch (error) {
                logger.error(`LinkedIn Auth Error: ${error}`);
                return done(error, undefined);
            }
        }
    )
);

export default passport;
