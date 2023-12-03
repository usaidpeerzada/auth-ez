import { EmailParams } from '../types';
import EmailService from './emailService';

export default class NodemailerEmailService extends EmailService {
  client: {
    sendMail?;
  };
  constructor(config = {}) {
    super(config);
    this.client = config;
  }

  async send(params: EmailParams): Promise<void> {
    const { toMail, mailType, url } = params;
    let { mailSubject, mailBody } = params;
    if (mailType === 'verification') {
      mailSubject =  mailSubject || 'Verify your email';
      mailBody = mailBody || `Click <a href="${url}">here</a> to verify your email.`;
    } else if (mailType === 'reset') {
      mailSubject =  mailSubject ||'Reset your password';
      mailBody =  mailBody || `Click <a href="${url}">here</a> to reset your password.`;
    }
    const mailOptions = {
      from: process.env.NODEMAILER_FROM_USER,
      to: toMail,
      subject: mailSubject,
      html: mailBody,
    };

    await this.client.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  }
}

module.exports = NodemailerEmailService;
