import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import appRouter from "./app.route.js"; 
import { errorHandler } from "./core/errors/errorHandler.js";
import { config } from "./core/config/index.config.js";
import { connectDB } from "./core/database/mongo.js";
import { requestId } from "./core/middlewares/request-id.middleware.js";
import { corsMiddleware, helmetMiddleware, hppMiddleware } from "./core/config/security.config.js";


dotenv.config();
const app: Express = express();

app.use(helmetMiddleware);
app.use(requestId);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hppMiddleware);

connectDB(); 

app.get("/", (req: Request, res: Response) => {res.send("API is running...");});
app.use("/api/v1", appRouter);
app.use(errorHandler);

const PORT = config.app.port;
app.listen(PORT, () => {
    console.log(`Server running in ${config.app.env} mode on port ${PORT}`);
});