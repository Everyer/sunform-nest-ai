export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export interface LoggingConfig {
    level: LogLevel;
    enableRequestLogging: boolean;
}
export interface RequestLogData {
    method: string;
    url: string;
    ip: string;
    userAgent?: string;
    statusCode: number;
    responseTime: string;
}
export declare class AiLoggerService {
    private level;
    private enableRequestLogging;
    constructor();
    setConfig(config: Partial<LoggingConfig>): void;
    private formatMessage;
    private shouldLog;
    info(message: string, data?: any): void;
    error(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    logRequest(requestData: RequestLogData): void;
    logChatRequest(data: {
        model: string;
        originalMessagesCount: number;
        optimizedMessagesCount: number;
        ruleType: string;
        hasCustomRules: boolean;
        tokenOptimization?: any;
    }): void;
    logTokenUsage(data: {
        originalTokens: number;
        managedTokens: number;
        savedTokens: number;
        compressionRatio: string;
    }): void;
    logCompressionStats(data: {
        originalCount: number;
        compressedCount: number;
        compressionType: string;
    }): void;
    logManagementDecision(data: {
        strategy: string;
        decision: string;
        reason: string;
    }): void;
}
