"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageConfig = void 0;
exports.messageConfig = {
    DEFAULT_STRATEGY: {
        maxContextTokens: 12000,
        reserveTokens: 4000,
        maxHistoryTurns: 10,
        enableCompression: true,
        compressionThreshold: 20
    },
    VUE_CODE_STRATEGY: {
        maxContextTokens: 8000,
        reserveTokens: 4000,
        maxHistoryTurns: 6,
        enableCompression: true,
        compressionThreshold: 30,
        keepLastCompleteCode: true
    },
    PROGRAMMING_STRATEGY: {
        maxContextTokens: 15000,
        reserveTokens: 3000,
        maxHistoryTurns: 12,
        enableCompression: true,
        compressionThreshold: 25,
        keepCodeStructure: true
    },
    CUSTOMER_SERVICE_STRATEGY: {
        maxContextTokens: 6000,
        reserveTokens: 2000,
        maxHistoryTurns: 8,
        enableCompression: true,
        compressionThreshold: 15,
        focusOnRecent: true
    },
    TOKEN_ESTIMATION: {
        chineseCharMultiplier: 1.8,
        englishCharMultiplier: 0.75,
        messageOverhead: 10,
        codeBlockOverhead: 20
    },
    COMPRESSION_RULES: {
        codeBlock: {
            enabled: true,
            maxLines: 30,
            keepHeadLines: 5,
            keepTailLines: 5,
            summaryTemplate: '// ... 省略 {count} 行代码 ...'
        },
        duplicateDetection: {
            enabled: true,
            similarity: 0.8,
            action: 'reference'
        },
        summary: {
            enabled: true,
            triggerLength: 5,
            maxSummaryTokens: 300,
            preserveContext: ['error', 'important', 'requirement']
        }
    },
    DEBUG: {
        logTokenUsage: true,
        logCompressionStats: true,
        logManagementDecisions: false
    }
};
//# sourceMappingURL=message.config.js.map