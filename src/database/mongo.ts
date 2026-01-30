import mongoose from "mongoose";
import { config } from "../config/index.js";
import { logger } from "../logger/logger.js";


export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(config.db.uri);
        logger.info("MongoDB Connected");
        
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
};

const shutdown = async () => {
    try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
        process.exit(0);
    } catch (error) {
        logger.error("Error during Mongo shutdown");
        process.exit(1);
    }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGQUIT", shutdown);