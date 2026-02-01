import nodemailer from "nodemailer";
import { logger } from "../logger/logger.js";

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Backend Toolkit" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
            });
            logger.info(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error(`Error sending email: ${error}`);
            return null;
        }
    }
}

export const emailService = new EmailService();