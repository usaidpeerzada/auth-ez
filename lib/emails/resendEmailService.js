"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const emailService_1 = tslib_1.__importDefault(require("./emailService"));
class ResendEmailService extends emailService_1.default {
    client;
    constructor(config = {}) {
        super(config);
        this.client = config;
    }
    async send(params) {
        try {
            const { toMail, mailType, url } = params;
            let { mailSubject, mailBody } = params;
            if (mailType === 'verification') {
                mailSubject = mailSubject || 'Verify your email';
                mailBody =
                    mailBody || `Click <a href="${url}">here</a> to verify your email.`;
            }
            else if (mailType === 'reset') {
                mailSubject = mailSubject || 'Reset your password';
                mailBody =
                    mailBody || `Click <a href="${url}">here</a> to reset your password.`;
            }
            const data = await this.client.emails.send({
                from: process.env.FROM_EMAIL || 'Auth EZ <onboarding@resend.dev>',
                to: toMail,
                subject: mailSubject,
                html: mailBody,
            });
            console.log(data);
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.default = ResendEmailService;
module.exports = ResendEmailService;
