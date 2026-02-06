import { Router } from "express"
import { 
    getMe, 
    updateUserProfile,
    changePhone,
    changePassword,
    createUser, 
    getUsers, 
    getUserById,
    deleteUser,
    toggleUserLock,
    changeUserRole,
    adminResetPassword
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


router.use(authenticate, authorize(UserRole.ADMIN));
router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);
router.patch('/:id/lock', toggleUserLock);
router.patch('/:id/role', changeUserRole);
router.patch('/:id/reset-password', adminResetPassword);


export default router;