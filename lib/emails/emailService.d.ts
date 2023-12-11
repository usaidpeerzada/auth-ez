export default class EmailService {
    emailClient: {
        send?: any;
    };
    constructor(config: any);
    sendEmail(params: any): Promise<void>;
}
