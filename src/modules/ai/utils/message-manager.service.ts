import { Injectable } from '@nestjs/common';
import { messageConfig, MessageStrategy, TokenEstimationConfig, CompressionRules } from '../config/message.config';
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

/**
 * Token估算工具
 */
export class TokenEstimator {
  private static config: TokenEstimationConfig = messageConfig.TOKEN_ESTIMATION;

  static estimateTokens(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    
    const { chineseCharMultiplier, englishCharMultiplier } = this.config;
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishChars = text.length - chineseChars;
    
    return Math.ceil(chineseChars * chineseCharMultiplier + englishChars * englishCharMultiplier);
  }

  static estimateMessageTokens(message: ChatMessage): number {
    const baseTokens = this.estimateTokens(message.content);
    const overhead = this.config.messageOverhead;
    
    // 代码块有额外开销
    const hasCodeBlock = /```[\s\S]*?```/.test(message.content);
    const codeOverhead = hasCodeBlock ? this.config.codeBlockOverhead : 0;
    
    return baseTokens + overhead + codeOverhead;
  }

  static estimateMessagesTokens(messages: ChatMessage[]): number {
    return messages.reduce((total, msg) => total + this.estimateMessageTokens(msg), 0);
  }
}

/**
 * 消息压缩器
 */
export class MessageCompressor {
  private static rules: CompressionRules = messageConfig.COMPRESSION_RULES;

  /**
   * 压缩长代码块
   */
  static compressCodeBlocks(content: string): string {
    if (!this.rules.codeBlock.enabled) {
      return content;
    }

    const { maxLines, keepHeadLines, keepTailLines, summaryTemplate } = this.rules.codeBlock;
    const codeBlockRegex = /```[\s\S]*?```/g;
    
    return content.replace(codeBlockRegex, (match) => {
      const lines = match.split('\n');
      
      // 如果代码块超过配置的行数，进行压缩
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

  /**
   * 生成对话摘要
   */
  static async generateSummary(messages: ChatMessage[], maxTokens: number = 200): Promise<ChatMessage> {
    // 简化版摘要生成
    const conversationContent = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    // 这里可以调用AI API生成摘要，现在用简化逻辑
    const summary = this.simpleTextSummary(conversationContent, maxTokens);
    
    return {
      role: 'system',
      content: `[对话摘要] ${summary}`
    };
  }

  /**
   * 简单文本摘要
   */
  static simpleTextSummary(text: string, maxTokens: number): string {
    const estimatedTokens = TokenEstimator.estimateTokens(text);
    
    if (estimatedTokens <= maxTokens) {
      return text;
    }
    
    // 简单截断并添加摘要标记
    const ratio = maxTokens / estimatedTokens;
    const cutLength = Math.floor(text.length * ratio * 0.8); // 保留80%确保不超限
    
    return text.substring(0, cutLength) + '...[内容过长已截断]';
  }
}

/**
 * 智能消息管理器
 */
@Injectable()
export class MessageManagerService {
  protected strategy: MessageStrategy;

  constructor(
    private readonly logger: AiLoggerService
  ) {
    this.strategy = messageConfig.DEFAULT_STRATEGY;
  }

  /**
   * 设置管理策略
   */
  setStrategy(strategy: MessageStrategy): void {
    this.strategy = strategy;
  }

  /**
   * 智能管理消息历史
   */
  async manageMessages(messages: ChatMessage[], systemMessage?: ChatMessage): Promise<ChatMessage[]> {
    if (!Array.isArray(messages) || messages.length === 0) {
      return systemMessage ? [systemMessage] : [];
    }

    // 1. 分离系统消息和对话消息
    const conversationMessages = messages.filter(msg => msg.role !== 'system');
    const finalSystemMessage = systemMessage || messages.find(msg => msg.role === 'system');

    // 2. 如果消息很少，直接返回
    if (conversationMessages.length <= 4) {
      const result = finalSystemMessage ? [finalSystemMessage, ...conversationMessages] : conversationMessages;
      return this.strategy.enableCompression ? this.compressMessages(result) : result;
    }

    // 3. 计算当前token使用量
    const availableTokens = this.strategy.maxContextTokens - this.strategy.reserveTokens;
    let currentTokens = finalSystemMessage ? TokenEstimator.estimateMessageTokens(finalSystemMessage) : 0;

    // 4. 使用滑动窗口策略
    const managedMessages = await this.applyWindowStrategy(
      conversationMessages, 
      availableTokens - currentTokens
    );

    // 5. 组装最终消息
    const finalMessages = finalSystemMessage ? [finalSystemMessage, ...managedMessages] : managedMessages;

    // 6. 应用压缩
    const result = this.strategy.enableCompression ? this.compressMessages(finalMessages) : finalMessages;

    // 7. 记录管理信息
    if (messageConfig.DEBUG.logManagementDecisions) {
      this.logger.logManagementDecision({
        strategy: this.constructor.name,
        decision: 'message_management_applied',
        reason: `从${messages.length}条消息优化到${result.length}条消息`
      });
    }

    return result;
  }

  /**
   * 应用滑动窗口策略
   */
  protected async applyWindowStrategy(messages: ChatMessage[], availableTokens: number): Promise<ChatMessage[]> {
    if (messages.length === 0) return [];

    // 从最新消息开始往前计算
    const result: ChatMessage[] = [];
    let currentTokens = 0;
    let messageIndex = messages.length - 1;

    // 1. 保留最新的消息（用户最新问题必须保留）
    while (messageIndex >= 0 && result.length < this.strategy.maxHistoryTurns * 2) {
      const message = messages[messageIndex];
      const messageTokens = TokenEstimator.estimateMessageTokens(message);

      // 检查是否还有空间
      if (currentTokens + messageTokens > availableTokens && result.length > 0) {
        break;
      }

      result.unshift(message);
      currentTokens += messageTokens;
      messageIndex--;
    }

    // 2. 如果还有历史消息未包含，生成摘要
    if (messageIndex >= 0) {
      const remainingMessages = messages.slice(0, messageIndex + 1);
      const summary = await MessageCompressor.generateSummary(remainingMessages, 300);
      
      // 检查摘要是否能放入
      const summaryTokens = TokenEstimator.estimateMessageTokens(summary);
      if (currentTokens + summaryTokens <= availableTokens) {
        result.unshift(summary);
      }
    }

    return result;
  }

  /**
   * 压缩消息内容
   */
  protected compressMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map((message, index) => {
      // 不压缩最后2条消息（保持完整性）
      if (index >= messages.length - 2) {
        return message;
      }

      // 压缩长内容
      const compressedContent = MessageCompressor.compressCodeBlocks(message.content);
      
      return {
        ...message,
        content: compressedContent
      };
    });
  }

  /**
   * 获取管理策略信息
   */
  getManagementInfo(originalMessages: ChatMessage[], managedMessages: ChatMessage[]): ManagementInfo {
    const originalTokens = TokenEstimator.estimateMessagesTokens(originalMessages);
    const managedTokens = TokenEstimator.estimateMessagesTokens(managedMessages);
    
    const info: ManagementInfo = {
      originalCount: originalMessages.length,
      managedCount: managedMessages.length,
      originalTokens,
      managedTokens,
      savedTokens: originalTokens - managedTokens,
      compressionRatio: `${((1 - managedTokens / originalTokens) * 100).toFixed(1)}%`
    };

    // 记录token使用情况
    if (messageConfig.DEBUG.logTokenUsage) {
      this.logger.logTokenUsage({
        originalTokens: info.originalTokens,
        managedTokens: info.managedTokens,
        savedTokens: info.savedTokens,
        compressionRatio: info.compressionRatio
      });
    }

    return info;
  }
}

/**
 * 针对Vue代码生成的特殊优化
 */
@Injectable()
export class VueCodeManagerService extends MessageManagerService {
  constructor(logger: AiLoggerService) {
    super(logger);
    this.strategy = messageConfig.VUE_CODE_STRATEGY;
  }

  /**
   * Vue代码特殊压缩逻辑
   */
  protected compressMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map((message, index) => {
      if (index >= messages.length - 1) return message; // 保留最后一条

      let content = message.content;

      // 压缩Vue代码块
      content = content.replace(/```html[\s\S]*?```/g, (match) => {
        const lines = match.split('\n');
        if (lines.length > 50) {
          // 提取关键信息：template结构、主要script逻辑、样式概要
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
}
