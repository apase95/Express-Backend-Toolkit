import { AppError } from "./AppError.js";

export class AuthError extends AppError {
    constructor(
        message: string = "Unauthorized Error",
        statusCode: number = 401,
    ) {
        super(
            message, 
            statusCode,
        );
    }
}
