export interface TokenEstimationConfig {
    chineseCharMultiplier: number;
    englishCharMultiplier: number;
    messageOverhead: number;
    codeBlockOverhead: number;
}
export interface MessageStrategy {
    maxContextTokens: number;
    reserveTokens: number;
    maxHistoryTurns: number;
    enableCompression: boolean;
    compressionThreshold: number;
    keepLastCompleteCode?: boolean;
    keepCodeStructure?: boolean;
    focusOnRecent?: boolean;
}
export interface CodeBlockCompressionRule {
    enabled: boolean;
    maxLines: number;
    keepHeadLines: number;
    keepTailLines: number;
    summaryTemplate: string;
}
export interface DuplicateDetectionRule {
    enabled: boolean;
    similarity: number;
    action: 'reference' | 'remove' | 'compress';
}
export interface SummaryRule {
    enabled: boolean;
    triggerLength: number;
    maxSummaryTokens: number;
    preserveContext: string[];
}
export interface CompressionRules {
    codeBlock: CodeBlockCompressionRule;
    duplicateDetection: DuplicateDetectionRule;
    summary: SummaryRule;
}
export interface DebugConfig {
    logTokenUsage: boolean;
    logCompressionStats: boolean;
    logManagementDecisions: boolean;
}
export interface MessageConfig {
    DEFAULT_STRATEGY: MessageStrategy;
    VUE_CODE_STRATEGY: MessageStrategy;
    PROGRAMMING_STRATEGY: MessageStrategy;
    CUSTOMER_SERVICE_STRATEGY: MessageStrategy;
    TOKEN_ESTIMATION: TokenEstimationConfig;
    COMPRESSION_RULES: CompressionRules;
    DEBUG: DebugConfig;
}
export declare const messageConfig: MessageConfig;
