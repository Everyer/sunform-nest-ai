import { Injectable } from '@nestjs/common';

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

@Injectable()
export class AiLoggerService {
  private level: LogLevel = 'info';
  private enableRequestLogging: boolean = true;

  constructor() {
    // 可以从配置服务或环境变量读取配置
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.enableRequestLogging = process.env.ENABLE_REQUEST_LOGGING !== 'false';
  }

  /**
   * 设置日志配置
   */
  setConfig(config: Partial<LoggingConfig>) {
    if (config.level) {
      this.level = config.level;
    }
    if (config.enableRequestLogging !== undefined) {
      this.enableRequestLogging = config.enableRequestLogging;
    }
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [AI-${level.toUpperCase()}] ${message}`;
    
    if (data) {
      return `${formattedMessage} ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  /**
   * 检查是否应该记录该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    
    return messageIndex <= currentLevelIndex;
  }

  /**
   * 记录信息日志
   */
  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  /**
   * 记录错误日志
   */
  error(message: string, data?: any) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  /**
   * 记录警告日志
   */
  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  /**
   * 记录调试日志
   */
  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  /**
   * 记录HTTP请求日志
   */
  logRequest(requestData: RequestLogData) {
    if (!this.enableRequestLogging) return;

    this.info('HTTP Request', requestData);
  }

  /**
   * 记录AI聊天请求
   */
  logChatRequest(data: {
    model: string;
    originalMessagesCount: number;
    optimizedMessagesCount: number;
    ruleType: string;
    hasCustomRules: boolean;
    tokenOptimization?: any;
  }) {
    this.info('AI Chat Request', data);
  }

  /**
   * 记录Token使用情况
   */
  logTokenUsage(data: {
    originalTokens: number;
    managedTokens: number;
    savedTokens: number;
    compressionRatio: string;
  }) {
    this.debug('Token Usage', data);
  }

  /**
   * 记录压缩统计
   */
  logCompressionStats(data: {
    originalCount: number;
    compressedCount: number;
    compressionType: string;
  }) {
    this.debug('Compression Stats', data);
  }

  /**
   * 记录管理决策过程
   */
  logManagementDecision(data: {
    strategy: string;
    decision: string;
    reason: string;
  }) {
    this.debug('Management Decision', data);
  }
}
