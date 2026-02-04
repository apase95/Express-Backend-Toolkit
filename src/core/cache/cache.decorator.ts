import { logger } from "../logger/logger.js";
import { cacheService } from "./cache.service.js";


interface CacheOptions {
    ttl?: number;
    key?: string;
    keyPrefix?: string;
};

export function Cacheable(options: CacheOptions = {}){
    return function(
        target: any,
        propertyKey: string,
        description: PropertyDescriptor
    ){
        const originalMethod = description.value;
        description.value = async function(...args: any[]) {
            const className = target.constructor.name;
            const argsString = JSON.stringify(args);
            const cacheKey = options.key
                ? options.key   
                : `${options.keyPrefix || `${className}:${propertyKey}`}:${argsString}`;

            try {
                const cachedData = await cacheService.get(cacheKey);
                if (cachedData) return cachedData;
            } catch (error) {
                logger.warn(`Cache middleware error ${error}`);
            }

            const result = await originalMethod.apply(this, args);
            if (result) {
                cacheService.set(cacheKey, result, options.ttl || 300);
            }
            return result;
        };

        return description;
    };
};