import { Router } from "express";
import authRoute from "./modules/auth/auth.route.js";
import userRoute from "./modules/user/user.route.js";
import paymentRoute from "./modules/payment/payment.route.js"; 
import orderRoute from "./modules/order/order.route.js";
import notificationRoute from "./modules/notification/notification.route.js";


const router = Router();

router.use("/auth", authRoute); 
router.use("/users", userRoute);
router.use("/payments", paymentRoute);
router.use("/orders", orderRoute);
router.use("/notifications", notificationRoute);


export default router;