export default class ResendEmailService {
    client: {
        emails?: any;
    };
    constructor(config?: {});
    send(params: any): Promise<void>;
}
