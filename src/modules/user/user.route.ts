import { Router } from "express"
import { 
    getMe, 
    updateUserProfile,
    changePhone,
    changePassword,
    createUser, 
    getUsers 
} from "./user.controller.js";
import { rateLimiter } from "../../core/middlewares/rate-limit.middleware.js";
import { authenticate, authorize } from "../../core/middlewares/auth.middleware.js";
import { UserRole } from "./user.model.js";
import { upload } from "../../core/middlewares/upload.middleware.js";


const router = Router();
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateUserProfile);
router.put('/me/avatar', authenticate, upload.single('avatar'), updateUserProfile);
router.patch('/me/phone', authenticate, changePhone);
router.put('/me/password', authenticate, changePassword);

router.get('/', authenticate, authorize(UserRole.ADMIN), getUsers);
router.post('/', authenticate, authorize(UserRole.ADMIN), createUser); 

export default router;