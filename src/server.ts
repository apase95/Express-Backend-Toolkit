import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './errors/errorHandler.js';
import { config } from './config/index.js';
import { connectDB } from './database/mongo.js';
import userRoute from './routes/user.route.js';


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

app.get('/', (req: Request, res: Response) => {
    res.send('API is running...');
});

app.use('/api/users', userRoute);

app.use(errorHandler);

const PORT = config.app.port;
app.listen(PORT, () => {
    console.log(`Server running in ${config.app.env} mode on port ${PORT}`);
});