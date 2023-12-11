import { EmailParams } from '../types';
import EmailService from './emailService';
export default class NodemailerEmailService extends EmailService {
    client: {
        sendMail?: any;
    };
    constructor(config?: {});
    send(params: EmailParams): Promise<void>;
}
