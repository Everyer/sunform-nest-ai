import { Request, Response } from 'express';
import { ConfigService } from '../services/config.service';
export declare class ProxyV2Controller {
    private readonly configService;
    constructor(configService: ConfigService);
    proxyRequest(request: Request, response: Response): Promise<void>;
}
