import { Redis } from "ioredis"; 
import { config } from "../config/index.config.js";
import { logger } from "../logger/logger.js";


class CacheService {
    private redis: Redis;

    constructor(){
        this.redis = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            ...(config.redis.password && { password: config.redis.password }),
            keyPrefix: config.redis.prefix,
            lazyConnect: true,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        
        this.redis.on("error", (err: Error) => {
            logger.warn(`Redis Connection Error: ${err.message}`);
        });

        this.redis.on("connect", () => {
            logger.info("Redis Connected");
        });
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            return null;
        }
    };

    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            const data = JSON.stringify(value);
            if (ttl) {
                await this.redis.set(key, data, "EX", ttl);
            } else {
                await this.redis.set(key, data);
            }
        } catch (error) {
            logger.error(`Cache Set Error: ${error}`);
        }
    };

    async del(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            logger.error(`Cache Del Error: ${error}`);
        }
    };

    async delByPattern(pattern: string): Promise<void> {
        try {
            const stream = this.redis.scanStream({
                match: config.redis.prefix + pattern,
            });
            
            stream.on("data", (keys: string[]) => {
                if (keys.length) {
                    const pipeline = this.redis.pipeline();
                    keys.forEach((key) => {
                        const keyWithoutPrefix = key.replace(config.redis.prefix, "");
                        pipeline.del(keyWithoutPrefix);
                    });
                    pipeline.exec();
                }
            });
        } catch (error) {
            logger.error(`Cache Clear Pattern Error: ${error}`);
        }
    };

    async ping(): Promise<string> {
        try {
            return await this.redis.ping();
        } catch (error) {
            return "FAILED";
        }
    };
}

export const cacheService = new CacheService();
