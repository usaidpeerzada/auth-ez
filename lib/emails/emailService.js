"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmailService {
    emailClient;
    constructor(config) {
        this.emailClient = config.emailClient;
    }
    async sendEmail(params) {
        if (this.emailClient) {
            this.emailClient.send(params);
        }
        else {
            console.log('Email client not configured.');
        }
    }
}
exports.default = EmailService;
