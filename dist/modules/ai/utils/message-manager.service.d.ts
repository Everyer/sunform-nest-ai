import { MessageStrategy } from '../config/message.config';
import { ChatMessage } from './system-rules.service';
import { AiLoggerService } from './logger.service';
export interface ManagementInfo {
    originalCount: number;
    managedCount: number;
    originalTokens: number;
    managedTokens: number;
    savedTokens: number;
    compressionRatio: string;
}
export declare class TokenEstimator {
    private static config;
    static estimateTokens(text: string): number;
    static estimateMessageTokens(message: ChatMessage): number;
    static estimateMessagesTokens(messages: ChatMessage[]): number;
}
export declare class MessageCompressor {
    private static rules;
    static compressCodeBlocks(content: string): string;
    static generateSummary(messages: ChatMessage[], maxTokens?: number): Promise<ChatMessage>;
    static simpleTextSummary(text: string, maxTokens: number): string;
}
export declare class MessageManagerService {
    private readonly logger;
    protected strategy: MessageStrategy;
    constructor(logger: AiLoggerService);
    setStrategy(strategy: MessageStrategy): void;
    manageMessages(messages: ChatMessage[], systemMessage?: ChatMessage): Promise<ChatMessage[]>;
    protected applyWindowStrategy(messages: ChatMessage[], availableTokens: number): Promise<ChatMessage[]>;
    protected compressMessages(messages: ChatMessage[]): ChatMessage[];
    getManagementInfo(originalMessages: ChatMessage[], managedMessages: ChatMessage[]): ManagementInfo;
}
export declare class VueCodeManagerService extends MessageManagerService {
    constructor(logger: AiLoggerService);
    protected compressMessages(messages: ChatMessage[]): ChatMessage[];
}
