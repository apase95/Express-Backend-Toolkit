import { Router } from "express";
import passport from "passport";
import { 
    getMe, 
    googleCallback, 
    linkedinCallback, 
    login, 
    logout, 
    refreshToken, 
    register 
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rate-limit.middleware.js";
import { config } from "../config/index.js";


const router = Router();

router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }));

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

router.get("/me", authenticate, getMe);

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