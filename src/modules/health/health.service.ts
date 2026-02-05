import mongoose from "mongoose";
import Stripe from "stripe";
import { cacheService } from "../../core/cache/cache.service.js";
import { config } from "../../core/config/index.config.js";


class HealthService {
    
    async checkDatabase() {
        const state = mongoose.connection.readyState;
        return state === 1 ? "UP" : "DOWN";
    };

    async checkRedis() {
        if (!config.redis.host) return "SKIPPED";
        const ping = await cacheService.ping();
        return ping === "PONG" ? "UP" : "DOWN";
    };

    async checkStripe() {
        if (!config.payment?.stripe?.secretKey) return "NOT_CONFIGURED";

        try {
            const stripe = new Stripe(config.payment.stripe.secretKey, {
                apiVersion: config.payment.stripe.apiVersion as any,
            });
            await stripe.balance.retrieve();
            
            return "UP";
        } catch (error) {
            return "DOWN";
        }
    };

    async getHealth() {
        const [mongo, redis, stripe] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkStripe()
        ]);

        const isHealthy = 
            mongo === "UP" 
            && (redis === "UP" || redis === "SKIPPED")
            && (stripe === "UP" || stripe === "NOT_CONFIGURED");

        return {
            status: isHealthy ? "OK" : "ERROR",
            timestamp: new Date().toISOString(),
            services: {
                database: mongo,
                redis: redis,
                stripe: stripe
            }
        };
    };
}

export const healthService = new HealthService();