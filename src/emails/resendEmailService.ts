export default class ResendEmailService {
  client: {
    emails?;
  };
  constructor(config = {}) {
    this.client = config;
  }

  async send(params): Promise<void> {
    try {
      const { toMail, mailType, url } = params;
      let { mailSubject, mailBody } = params;
      if (mailType === 'verification') {
        mailSubject = mailSubject || 'Verify your email';
        mailBody =
          mailBody || `Click <a href="${url}">here</a> to verify your email.`;
      } else if (mailType === 'reset') {
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
    } catch (error) {
      console.error(error);
    }
  }
}
