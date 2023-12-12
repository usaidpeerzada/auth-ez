import { EmailParams } from '../types';
export default class NodemailerEmailService {
    client: {
        sendMail?: any;
    };
    constructor(config?: {});
    send(params: EmailParams): Promise<void>;
}
