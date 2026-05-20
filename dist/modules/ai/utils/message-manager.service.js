"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VueCodeManagerService = exports.MessageManagerService = exports.MessageCompressor = exports.TokenEstimator = void 0;
const common_1 = require("@nestjs/common");
const message_config_1 = require("../config/message.config");
const logger_service_1 = require("./logger.service");
class TokenEstimator {
    static estimateTokens(text) {
        if (!text || typeof text !== 'string')
            return 0;
        const { chineseCharMultiplier, englishCharMultiplier } = this.config;
        const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
        const englishChars = text.length - chineseChars;
        return Math.ceil(chineseChars * chineseCharMultiplier + englishChars * englishCharMultiplier);
    }
    static estimateMessageTokens(message) {
        const baseTokens = this.estimateTokens(message.content);
        const overhead = this.config.messageOverhead;
        const hasCodeBlock = /```[\s\S]*?```/.test(message.content);
        const codeOverhead = hasCodeBlock ? this.config.codeBlockOverhead : 0;
        return baseTokens + overhead + codeOverhead;
    }
    static estimateMessagesTokens(messages) {
        return messages.reduce((total, msg) => total + this.estimateMessageTokens(msg), 0);
    }
}
exports.TokenEstimator = TokenEstimator;
TokenEstimator.config = message_config_1.messageConfig.TOKEN_ESTIMATION;
class MessageCompressor {
    static compressCodeBlocks(content) {
        if (!this.rules.codeBlock.enabled) {
            return content;
        }
        const { maxLines, keepHeadLines, keepTailLines, summaryTemplate } = this.rules.codeBlock;
        const codeBlockRegex = /```[\s\S]*?```/g;
        return content.replace(codeBlockRegex, (match) => {
            const lines = match.split('\n');
            if (lines.length > maxLines) {
                const header = lines.slice(0, keepHeadLines).join('\n');
                const footer = lines.slice(-keepTailLines).join('\n');
                const omittedCount = lines.length - keepHeadLines - keepTailLines;
                const summary = summaryTemplate.replace('{count}', omittedCount.toString());
                return `${header}\n\n${summary}\n\n${footer}`;
            }
            return match;
        });
    }
    static async generateSummary(messages, maxTokens = 200) {
        const conversationContent = messages
            .filter(msg => msg.role !== 'system')
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n\n');
        const summary = this.simpleTextSummary(conversationContent, maxTokens);
        return {
            role: 'system',
            content: `[对话摘要] ${summary}`
        };
    }
    static simpleTextSummary(text, maxTokens) {
        const estimatedTokens = TokenEstimator.estimateTokens(text);
        if (estimatedTokens <= maxTokens) {
            return text;
        }
        const ratio = maxTokens / estimatedTokens;
        const cutLength = Math.floor(text.length * ratio * 0.8);
        return text.substring(0, cutLength) + '...[内容过长已截断]';
    }
}
exports.MessageCompressor = MessageCompressor;
MessageCompressor.rules = message_config_1.messageConfig.COMPRESSION_RULES;
let MessageManagerService = class MessageManagerService {
    constructor(logger) {
        this.logger = logger;
        this.strategy = message_config_1.messageConfig.DEFAULT_STRATEGY;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    async manageMessages(messages, systemMessage) {
        if (!Array.isArray(messages) || messages.length === 0) {
            return systemMessage ? [systemMessage] : [];
        }
        const conversationMessages = messages.filter(msg => msg.role !== 'system');
        const finalSystemMessage = systemMessage || messages.find(msg => msg.role === 'system');
        if (conversationMessages.length <= 4) {
            const result = finalSystemMessage ? [finalSystemMessage, ...conversationMessages] : conversationMessages;
            return this.strategy.enableCompression ? this.compressMessages(result) : result;
        }
        const availableTokens = this.strategy.maxContextTokens - this.strategy.reserveTokens;
        let currentTokens = finalSystemMessage ? TokenEstimator.estimateMessageTokens(finalSystemMessage) : 0;
        const managedMessages = await this.applyWindowStrategy(conversationMessages, availableTokens - currentTokens);
        const finalMessages = finalSystemMessage ? [finalSystemMessage, ...managedMessages] : managedMessages;
        const result = this.strategy.enableCompression ? this.compressMessages(finalMessages) : finalMessages;
        if (message_config_1.messageConfig.DEBUG.logManagementDecisions) {
            this.logger.logManagementDecision({
                strategy: this.constructor.name,
                decision: 'message_management_applied',
                reason: `从${messages.length}条消息优化到${result.length}条消息`
            });
        }
        return result;
    }
    async applyWindowStrategy(messages, availableTokens) {
        if (messages.length === 0)
            return [];
        const result = [];
        let currentTokens = 0;
        let messageIndex = messages.length - 1;
        while (messageIndex >= 0 && result.length < this.strategy.maxHistoryTurns * 2) {
            const message = messages[messageIndex];
            const messageTokens = TokenEstimator.estimateMessageTokens(message);
            if (currentTokens + messageTokens > availableTokens && result.length > 0) {
                break;
            }
            result.unshift(message);
            currentTokens += messageTokens;
            messageIndex--;
        }
        if (messageIndex >= 0) {
            const remainingMessages = messages.slice(0, messageIndex + 1);
            const summary = await MessageCompressor.generateSummary(remainingMessages, 300);
            const summaryTokens = TokenEstimator.estimateMessageTokens(summary);
            if (currentTokens + summaryTokens <= availableTokens) {
                result.unshift(summary);
            }
        }
        return result;
    }
    compressMessages(messages) {
        return messages.map((message, index) => {
            if (index >= messages.length - 2) {
                return message;
            }
            const compressedContent = MessageCompressor.compressCodeBlocks(message.content);
            return {
                ...message,
                content: compressedContent
            };
        });
    }
    getManagementInfo(originalMessages, managedMessages) {
        const originalTokens = TokenEstimator.estimateMessagesTokens(originalMessages);
        const managedTokens = TokenEstimator.estimateMessagesTokens(managedMessages);
        const info = {
            originalCount: originalMessages.length,
            managedCount: managedMessages.length,
            originalTokens,
            managedTokens,
            savedTokens: originalTokens - managedTokens,
            compressionRatio: `${((1 - managedTokens / originalTokens) * 100).toFixed(1)}%`
        };
        if (message_config_1.messageConfig.DEBUG.logTokenUsage) {
            this.logger.logTokenUsage({
                originalTokens: info.originalTokens,
                managedTokens: info.managedTokens,
                savedTokens: info.savedTokens,
                compressionRatio: info.compressionRatio
            });
        }
        return info;
    }
};
exports.MessageManagerService = MessageManagerService;
exports.MessageManagerService = MessageManagerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.AiLoggerService])
], MessageManagerService);
let VueCodeManagerService = class VueCodeManagerService extends MessageManagerService {
    constructor(logger) {
        super(logger);
        this.strategy = message_config_1.messageConfig.VUE_CODE_STRATEGY;
    }
    compressMessages(messages) {
        return messages.map((message, index) => {
            if (index >= messages.length - 1)
                return message;
            let content = message.content;
            content = content.replace(/```html[\s\S]*?```/g, (match) => {
                const lines = match.split('\n');
                if (lines.length > 50) {
                    const templateMatch = match.match(/<template>[\s\S]*?<\/template>/);
                    const scriptMatch = match.match(/<script[\s\S]*?<\/script>/);
                    let compressed = '```html\n// Vue组件摘要:\n';
                    if (templateMatch) {
                        const templateLines = templateMatch[0].split('\n').slice(1, -1);
                        compressed += `// Template: ${templateLines.slice(0, 3).join(' ').replace(/\s+/g, ' ')}\n`;
                    }
                    if (scriptMatch) {
                        compressed += `// Script: 包含props定义和业务逻辑\n`;
                    }
                    compressed += '// ...[已压缩Vue代码]\n```';
                    return compressed;
                }
                return match;
            });
            return { ...message, content };
        });
    }
};
exports.VueCodeManagerService = VueCodeManagerService;
exports.VueCodeManagerService = VueCodeManagerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.AiLoggerService])
], VueCodeManagerService);
//# sourceMappingURL=message-manager.service.js.map