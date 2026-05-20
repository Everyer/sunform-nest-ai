import { ConfigService } from './config.service';
export declare class ProxyService {
    private readonly configService;
    constructor(configService: ConfigService);
    validateUserConfig(userid: string): Promise<void>;
    buildTargetUrl(host: string, baseUrl: string | undefined, apiPath: string): string;
    cleanHeaders(originalHeaders: Record<string, any>): Record<string, any>;
    cleanResponseHeaders(originalHeaders: Record<string, any>): Record<string, any>;
    logProxyRequest(userid: string, method: string, originalUrl: string, targetUrl: string, status?: number, error?: string): void;
}
