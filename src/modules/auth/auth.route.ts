import { Router } from "express";
import passport from "passport";
import { 
    forgotPassword,
    googleCallback, 
    linkedinCallback, 
    login, 
    logout, 
    refreshToken, 
    register, 
    resetPassword, 
    verifyEmail
} from "./auth.controller.js";
import { rateLimiter } from "../../core/middlewares/rate-limit.middleware.js";
import { config } from "../../core/config/index.config.js";
import { validate } from "../../core/middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";


const router = Router();

router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }));


router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


router.get("/google", passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false
}));
router.get("/google/callback", 
    passport.authenticate("google", {
        session: false, 
        failureRedirect: `${config.app.clientUrl}/login?error=google_failed` 
    }),
    googleCallback
);


router.get("/linkedin", passport.authenticate("linkedin", { 
    scope: ["r_emailaddress", "r_liteprofile"],
    session: false
}));
router.get("/linkedin/callback", 
    passport.authenticate("linkedin", {
        session: false, 
        failureRedirect: `${config.app.clientUrl}/login?error=linkedin_failed` 
    }),
    linkedinCallback
);

export default router;