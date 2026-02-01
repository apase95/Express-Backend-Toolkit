import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        email: z.email("Invalid email format"),
        displayName: z.string().min(3, "Display name must be at least 3 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    }),
});