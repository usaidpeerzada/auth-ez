"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NodemailerEmailService {
    client;
    constructor(config = {}) {
        this.client = config;
    }
    async send(params) {
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
        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: toMail,
            subject: mailSubject,
            html: mailBody,
        };
        await this.client.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log(`Email sent: ${info.response}`);
            }
        });
    }
}
exports.default = NodemailerEmailService;
