import EmailService from './emailService';
export default class ResendEmailService extends EmailService {
    client: {
        emails?: any;
    };
    constructor(config?: {});
    send(params: any): Promise<void>;
}
