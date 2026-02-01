import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
    public errors: any[];

    constructor(
        message: string, 
        errors: any[] = []
    ) {
        super(message, 400);
        this.errors = errors;
    }
}