export default class EmailService {
  emailClient: {
    send?;
  };
  constructor(config) {
    this.emailClient = config.emailClient;
  }

  async sendEmail(params): Promise<void> {
    if (this.emailClient) {
      this.emailClient.send(params);
    } else {
      console.log('Email client not configured.');
    }
  }
}
