import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./core/errors/errorHandler.js";
import { config } from "./core/config/index.config.js";
import { connectDB } from "./core/database/mongo.js";
import authRoute from "./modules/auth/auth.route.js";
import userRoute from "./modules/user/user.route.js";


dotenv.config();
const app: Express = express();

app.use(cors({
    origin: config.app.clientUrl,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB(); 

app.get("/", (req: Request, res: Response) => {
    res.send("API is running...");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);

app.use(errorHandler);

const PORT = config.app.port;
app.listen(PORT, () => {
    console.log(`Server running in ${config.app.env} mode on port ${PORT}`);
});