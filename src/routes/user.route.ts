import { Router } from "express"
import { createUser, getUsers } from "../controllers/user.controller.js";
import { rateLimiter } from "../middlewares/rate-limit.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { UserRole } from "../models/user.model.js";

const router = Router();
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

router.get('/', authenticate, authorize(UserRole.ADMIN), getUsers);
router.post('/', authenticate, authorize(UserRole.ADMIN), createUser); 

export default router;