/**
 * 消息管理配置
 */
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

export const messageConfig: MessageConfig = {
  // 默认token管理策略
  DEFAULT_STRATEGY: {
    maxContextTokens: 12000,    // 最大上下文tokens
    reserveTokens: 4000,        // 为回复预留的tokens
    maxHistoryTurns: 10,        // 最大保留对话轮数
    enableCompression: true,    // 启用内容压缩
    compressionThreshold: 20    // 超过多少行代码开始压缩
  },

  // Vue代码生成专用策略
  VUE_CODE_STRATEGY: {
    maxContextTokens: 8000,     // Vue场景适中的上下文
    reserveTokens: 4000,        // 为生成的Vue代码预留更多空间
    maxHistoryTurns: 6,         // 代码对话轮数可以少一些
    enableCompression: true,
    compressionThreshold: 30,   // Vue代码压缩阈值更宽松
    keepLastCompleteCode: true  // 保留最后一个完整的代码示例
  },

  // 编程助手策略
  PROGRAMMING_STRATEGY: {
    maxContextTokens: 15000,    // 编程场景需要更多上下文
    reserveTokens: 3000,
    maxHistoryTurns: 12,
    enableCompression: true,
    compressionThreshold: 25,
    keepCodeStructure: true     // 保持代码结构完整性
  },

  // 客服策略（最节省tokens）
  CUSTOMER_SERVICE_STRATEGY: {
    maxContextTokens: 6000,     // 客服场景可以更精简
    reserveTokens: 2000,
    maxHistoryTurns: 8,
    enableCompression: true,
    compressionThreshold: 15,
    focusOnRecent: true         // 重点关注最近的对话
  },

  // Token估算规则
  TOKEN_ESTIMATION: {
    chineseCharMultiplier: 1.8,   // 中文字符token倍数
    englishCharMultiplier: 0.75,  // 英文字符token倍数
    messageOverhead: 10,          // 每条消息的元数据开销
    codeBlockOverhead: 20         // 代码块额外开销
  },

  // 压缩规则
  COMPRESSION_RULES: {
    // 代码块压缩
    codeBlock: {
      enabled: true,
      maxLines: 30,               // 超过多少行开始压缩
      keepHeadLines: 5,           // 保留开头行数
      keepTailLines: 5,           // 保留结尾行数
      summaryTemplate: '// ... 省略 {count} 行代码 ...'
    },

    // 重复内容检测
    duplicateDetection: {
      enabled: true,
      similarity: 0.8,            // 相似度阈值
      action: 'reference'         // 处理方式: 'reference' | 'remove' | 'compress'
    },

    // 对话摘要
    summary: {
      enabled: true,
      triggerLength: 5,           // 超过多少轮对话开始摘要
      maxSummaryTokens: 300,      // 摘要最大tokens
      preserveContext: ['error', 'important', 'requirement'] // 保留的关键词类型
    }
  },

  // 调试配置
  DEBUG: {
    logTokenUsage: true,          // 记录token使用情况
    logCompressionStats: true,    // 记录压缩统计
    logManagementDecisions: false // 记录管理决策过程（详细日志）
  }
};
