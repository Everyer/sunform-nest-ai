import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { SystemRulesService, RuleType, ChatMessage } from './utils/system-rules.service';
import { MessageManagerService, VueCodeManagerService, ManagementInfo } from './utils/message-manager.service';
import { AiLoggerService } from './utils/logger.service';
import { ContinuationDetectorService, ContinuationContext } from './utils/continuation-detector.service';
import { messageConfig } from './config/message.config';
import {
  StreamChatDto,
  CompletionChatDto,
  GetModelsDto,
  BaseResponseDto,
  GetModelsResponseDto,
  CozeWorkflowRunDto,
  CozeWorkflowStreamRunDto,
  CozeWorkflowResponseDto
} from './dto/chat.dto';

@Injectable()
export class AiService {
  private readonly siliconflowApiKey: string;
  private readonly siliconflowBaseUrl: string;
  private readonly cozeApiKey: string;
  private readonly cozeBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly systemRulesService: SystemRulesService,
    private readonly messageManagerService: MessageManagerService,
    private readonly vueCodeManagerService: VueCodeManagerService,
    private readonly logger: AiLoggerService,
    private readonly continuationDetector: ContinuationDetectorService,
  ) {
    // 优先读取 AI_AGENT_API_KEY 作为全局统一的 AI 密钥，兼容旧版 SILICONFLOW_API_KEY
    this.siliconflowApiKey = this.configService.get<string>('AI_AGENT_API_KEY') ||
      this.configService.get<string>('SILICONFLOW_API_KEY') ||
      'sk-cp-je2E8r2_MASzUY5OO2gEirUluf1JgZQQEuezB0VifE1AMPZ1da9yb4j3EDrDLA131CbyUjcdGkkzkCJvL59UnmSYQDsGImTpjlHdVDjMF7mel1_2-Q_8M5I';

    // 优先读取 AI_AGENT_BASE_URL 并自动剥离 /chat/completions 后缀，规范化为 Base URL
    const rawBaseUrl = this.configService.get<string>('AI_AGENT_BASE_URL') ||
      this.configService.get<string>('SILICONFLOW_BASE_URL') ||
      'https://api.minimaxi.com/v1';
    this.siliconflowBaseUrl = rawBaseUrl.replace(/\/chat\/completions\/?$/, '').replace(/\/$/, '');

    // Coze API 配置
    this.cozeApiKey = this.configService.get<string>('COZE_API_KEY') || 'pat_a7d9C2KTexEjWNmfdt22nQEZUqhkX1vd28We5b6W642hWrW9Awo7HtbupRlUJ5Uv';
    this.cozeBaseUrl = this.configService.get<string>('COZE_BASE_URL') ||
      'https://api.coze.cn/v1/workflow/';
  }

  /**
   * 流式聊天接口（支持自动续写判定）
   */
  async streamChat(streamChatDto: StreamChatDto): Promise<AxiosResponse> {
    try {
      const { messages, model, ruleType, customRules, ...otherParams } = streamChatDto;

      // 添加系统规则到消息中
      const messagesWithRules = this.systemRulesService.addSystemRules(
        messages as ChatMessage[],
        ruleType || 'default',
        customRules
      );

      // 根据规则类型选择合适的消息管理策略
      const messageManager = this.getMessageManager(ruleType || 'default');
      const systemMessage = messagesWithRules.find(msg => msg.role === 'system');
      const conversationMessages = messagesWithRules.filter(msg => msg.role !== 'system');
      
      const optimizedMessages = await messageManager.manageMessages(conversationMessages, systemMessage);
      console.log(ruleType);

      // 获取优化信息用于日志
      const managementInfo = messageManager.getManagementInfo(messagesWithRules, optimizedMessages);
      const defaultModel = this.configService.get<string>('AI_AGENT_MODEL') || 'MiniMax-M2.7';
      const requestData = {
        model: model || defaultModel,
        messages: optimizedMessages,
        stream: true,
        max_tokens: streamChatDto.max_tokens || 10000,
        // max_tokens: 100,
        ...otherParams
      };
      // 记录请求日志
      this.logger.logChatRequest({
        model: requestData.model,
        originalMessagesCount: messagesWithRules.length,
        optimizedMessagesCount: optimizedMessages.length,
        ruleType: ruleType || 'default',
        hasCustomRules: !!customRules,
        tokenOptimization: managementInfo,
      });

      // 创建自定义流响应，支持自动续写
      return this.createSmartStreamResponse(requestData, optimizedMessages, model);

    } catch (error: any) {
      this.logger.error('流式聊天服务错误', error);
      throw error;
    }
  }

  /**
   * 创建智能流式响应（支持自动续写）
   */
  private async createSmartStreamResponse(
    requestData: any,
    messages: ChatMessage[],
    model?: string
  ): Promise<AxiosResponse> {
    const { PassThrough } = require('stream');
    const smartStream = new PassThrough();
    // 创建模拟的 AxiosResponse 对象
    const mockResponse = {
      data: smartStream,
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'text/event-stream'
      },
      config: {
        headers: {}
      },
      request: {}
    } as unknown as AxiosResponse;

    // 异步处理流式响应和续写逻辑
    this.handleSmartStreamResponse(requestData, messages, smartStream, model);

    return mockResponse;
  }

  /**
   * 处理智能流式响应
   */
  private async handleSmartStreamResponse(
    requestData: any,
    messages: ChatMessage[],
    outputStream: any,
    model?: string
  ): Promise<void> {
    try {
      let accumulatedContent = '';
      let finishReason = '';

      // 发起第一次请求
      const response = await axios({
        method: 'POST',
        url: `${this.siliconflowBaseUrl}/chat/completions`,
        headers: {
          'Authorization': `Bearer ${this.siliconflowApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        data: requestData,
        responseType: 'stream'
      });
      // 处理第一次响应的流数据
      response.data.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        outputStream.write(chunkStr);

        // 提取内容和finish_reason
        this.extractContentFromChunk(chunkStr, (content: string) => {
          accumulatedContent += content;
        });
        
        // 提取finish_reason
        const extractedFinishReason = this.extractFinishReasonFromChunk(chunkStr);
        if (extractedFinishReason) {
          finishReason = extractedFinishReason;
        }
      });

      // 第一次响应结束后，判断是否需要续写
      response.data.on('end', async () => {
        try {
          // 判断是否需要续写
          const continuationContext: ContinuationContext = {
            finishReason: finishReason,
            messages: messages,
            model: model
          };
          const decision = this.continuationDetector.shouldContinue(continuationContext);
          
          this.logger.info('续写判定结果', {
            finishReason: finishReason,
            shouldContinue: decision.shouldContinue,
            confidence: decision.confidence,
            reason: decision.reason,
            contentLength: accumulatedContent.length
          });

          if (decision.shouldContinue && decision.confidence > 0.6) {
            // 需要续写，发起续写请求
            await this.performContinuation(
              messages,
              accumulatedContent,
              decision.continuationPrompt || '请继续',
              outputStream,
              requestData
            );
          } else {
            // 不需要续写，直接结束流
            outputStream.end();
          }
        } catch (error) {
          this.logger.error('续写判定错误', error);
          outputStream.end();
        }
      });

      response.data.on('error', (error: any) => {
        this.logger.error('第一次响应流错误', error);
        outputStream.emit('error', error);
      });

    } catch (error: any) {
      this.logger.error('智能流响应处理错误', error);
      outputStream.emit('error', error);
    }
  }

  /**
   * 执行续写操作
   */
  private async performContinuation(
    originalMessages: ChatMessage[],
    previousContent: string,
    continuationPrompt: string,
    outputStream: any,
    originalRequestData: any
  ): Promise<void> {
    try {
      // 构建续写消息 - 需要特殊处理系统规则
      const continuationMessages: ChatMessage[] = [
        // 使用专门的续写系统规则，避免与原有规则冲突
        {
          role: 'system',
          content: this.generateContinuationSystemRule(previousContent)
        },
        // 移除原始消息中的系统消息，避免冲突
        ...originalMessages.filter(msg => msg.role !== 'system'),
        {
          role: 'assistant',
          content: previousContent
        },
        {
          role: 'user',
          content: this.generateOptimizedContinuationPrompt(previousContent, continuationPrompt)
        }
      ];

      // 构建续写请求
      const continuationRequestData = {
        ...originalRequestData,
        messages: continuationMessages,
        max_tokens: Math.min(originalRequestData.max_tokens || 5000, 3000) // 续写部分限制token数
      };

      this.logger.info('开始续写', {
        originalContentLength: previousContent.length,
        continuationPrompt
      });

      // 发起续写请求
      const continuationResponse = await axios({
        method: 'POST',
        url: `${this.siliconflowBaseUrl}/chat/completions`,
        headers: {
          'Authorization': `Bearer ${this.siliconflowApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        data: continuationRequestData,
        responseType: 'stream'
      });

      // 转发续写内容
      continuationResponse.data.on('data', (chunk: Buffer) => {
        const chunkStr = chunk.toString();
        outputStream.write(chunkStr);
      });

      continuationResponse.data.on('end', () => {
        outputStream.end();
      });

      continuationResponse.data.on('error', (error: any) => {
        this.logger.error('续写响应流错误', error);
        outputStream.end();
      });

    } catch (error: any) {
      this.logger.error('续写执行错误', error);
      outputStream.end();
    }
  }

  /**
   * 从SSE chunk中提取内容
   */
  private extractContentFromChunk(chunkStr: string, callback: (content: string) => void): void {
    try {
      const lines = chunkStr.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const jsonStr = line.substring(6).trim();
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                callback(content);
              }
            }
          } catch (parseError) {
            // 忽略JSON解析错误
          }
        }
      }
    } catch (error) {
      // 忽略提取错误
    }
  }

  /**
   * 从SSE chunk中提取finish_reason
   */
  private extractFinishReasonFromChunk(chunkStr: string): string | null {
    try {
      const lines = chunkStr.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const jsonStr = line.substring(6).trim();
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              const finishReason = data.choices?.[0]?.finish_reason;
              if (finishReason) {
                return finishReason;
              }
            }
          } catch (parseError) {
            // 忽略JSON解析错误
          }
        }
      }
    } catch (error) {
      // 忽略提取错误
    }
    return null;
  }

  /**
   * 生成优化的续写提示词
   */
  private generateOptimizedContinuationPrompt(previousContent: string, defaultPrompt: string): string {
    // 检测内容类型并生成针对性的续写提示
    if (this.isVueCode(previousContent)) {
      return `请继续完成上面的Vue组件代码，注意：
1. 不要重复已有的内容
2. 直接从代码中断的地方继续写
3. 保持代码格式和缩进一致
4. 确保语法正确和结构完整
5. 如果是HTML标签未闭合，请正确闭合
6. 不要添加代码块标记（如\`\`\`html），直接输出代码内容
7. 不要重新开始整个模板结构
请继续：`;
    }
    
    if (this.isHtmlCode(previousContent)) {
      return `请继续完成上面的HTML代码，注意：
1. 不要重复任何已有内容
2. 从代码截断处直接继续
3. 保持正确的HTML格式和缩进
4. 确保标签正确闭合
5. 不要添加代码块标记（如\`\`\`html），直接输出代码内容
请继续：`;
    }
    
    if (this.isJavaScriptCode(previousContent)) {
      return `请继续完成上面的JavaScript代码，注意：
1. 不要重复已有代码
2. 从中断处直接继续
3. 保持代码风格一致
4. 确保语法正确
5. 不要添加代码块标记，直接输出代码内容
请继续：`;
    }
    
    if (this.isArticleContent(previousContent)) {
      return `请继续完成上面的文章内容，注意：
1. 不要重复已写的内容
2. 保持文章风格和语调一致
3. 逻辑连贯，自然过渡
4. 从上一句话自然接续
请继续：`;
    }
    
    // 通用续写提示
    return `请继续完成上面的内容，注意：
1. 不要重复任何已有内容
2. 从中断的地方自然接续
3. 保持风格和格式一致
4. 确保内容连贯完整
5. 如果是代码续写，不要添加代码块标记，直接输出代码内容
请继续：`;
  }

  /**
   * 检测是否为Vue代码
   */
  private isVueCode(content: string): boolean {
    return /(<template>|<script|<style|\.vue|v-model|v-if|v-for|defineProps|defineEmits)/i.test(content);
  }

  /**
   * 检测是否为HTML代码
   */
  private isHtmlCode(content: string): boolean {
    return /(<\/?\w+[^>]*>|<!DOCTYPE|<html|<head|<body)/i.test(content);
  }

  /**
   * 检测是否为JavaScript代码
   */
  private isJavaScriptCode(content: string): boolean {
    return /(function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|class\s+\w+|import\s+.*from|export\s+)/i.test(content);
  }

  /**
   * 检测是否为文章内容
   */
  private isArticleContent(content: string): boolean {
    // 检查是否包含中文句子和段落特征
    const chineseText = /[\u4e00-\u9fa5]+/g.test(content);
    const hasParagraphs = content.includes('\n\n') || content.length > 100;
    const noCodeMarkers = !/<[^>]+>/.test(content) && !/(function|const|let|var)\s+\w+/.test(content);
    
    return chineseText && hasParagraphs && noCodeMarkers;
  }

  /**
   * 生成续写专用的系统规则
   */
  private generateContinuationSystemRule(previousContent: string): string {
    if (this.isVueCode(previousContent)) {
      return `你是一个专业的Vue代码续写助手。你的任务是：
1. 续写Vue组件代码，从中断处直接继续
2. 不要重复任何已有内容
3. 不要添加代码块标记（如\`\`\`html），直接输出纯代码
4. 保持代码格式和缩进一致
5. 确保语法正确，标签正确闭合
6. 不要重新开始整个模板结构
7. 只输出需要续写的部分`;
    }
    
    if (this.isHtmlCode(previousContent)) {
      return `你是一个专业的HTML代码续写助手。你的任务是：
1. 续写HTML代码，从中断处直接继续
2. 不要重复任何已有内容
3. 不要添加代码块标记，直接输出纯HTML
4. 保持正确的格式和缩进
5. 确保标签正确闭合`;
    }
    
    if (this.isJavaScriptCode(previousContent)) {
      return `你是一个专业的JavaScript代码续写助手。你的任务是：
1. 续写JavaScript代码，从中断处直接继续
2. 不要重复任何已有内容
3. 不要添加代码块标记，直接输出纯代码
4. 保持代码风格一致
5. 确保语法正确`;
    }
    
    // 通用续写规则
    return `你是一个专业的内容续写助手。你的任务是：
1. 从中断处自然接续内容
2. 不要重复任何已有内容
3. 保持风格和格式一致
4. 确保内容连贯完整
5. 如果是代码，不要添加代码块标记，直接输出纯代码`;
  }

  /**
   * 非流式聊天接口
   */
  async completionChat(completionChatDto: CompletionChatDto): Promise<any> {
    try {
      const { messages, model, ruleType, customRules, ...otherParams } = completionChatDto;

      // 添加系统规则到消息中
      const messagesWithRules = this.systemRulesService.addSystemRules(
        messages as ChatMessage[],
        ruleType || 'default',
        customRules
      );

      // 根据规则类型选择合适的消息管理策略  
      const messageManager = this.getMessageManager(ruleType || 'default');

      const systemMessage = messagesWithRules.find(msg => msg.role === 'system');
      const conversationMessages = messagesWithRules.filter(msg => msg.role !== 'system');

      const optimizedMessages = await messageManager.manageMessages(conversationMessages, systemMessage);
      const managementInfo = messageManager.getManagementInfo(messagesWithRules, optimizedMessages);

      const defaultModel = this.configService.get<string>('AI_AGENT_MODEL') || 'MiniMax-M2.7';
      const requestData = {
        model: model || defaultModel,
        messages: optimizedMessages,
        stream: false,
        max_tokens: completionChatDto.max_tokens || 4000,
        ...otherParams
      };

      // 记录请求日志
      this.logger.logChatRequest({
        model: requestData.model,
        originalMessagesCount: messagesWithRules.length,
        optimizedMessagesCount: optimizedMessages.length,
        ruleType: ruleType || 'default',
        hasCustomRules: !!customRules,
        tokenOptimization: managementInfo,
      });

      // 发起请求到硅基流动API
      const response = await axios({
        method: 'POST',
        url: `${this.siliconflowBaseUrl}/chat/completions`,
        headers: {
          'Authorization': `Bearer ${this.siliconflowApiKey}`,
          'Content-Type': 'application/json'
        },
        data: requestData
      });

      return response.data;

    } catch (error: any) {
      this.logger.error('聊天完成请求错误', {
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  /**
   * 获取模型列表
   */
  async getModels(getModelsDto: GetModelsDto): Promise<GetModelsResponseDto> {
    try {
      const { type, sub_type } = getModelsDto;

      // 构建查询参数
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      if (sub_type) queryParams.append('sub_type', sub_type);

      const queryString = queryParams.toString();
      const url = `${this.siliconflowBaseUrl}/models${queryString ? `?${queryString}` : ''}`;

      this.logger.info('获取模型列表', { type, sub_type, url });

      // 发起请求到硅基流动API
      const response = await axios({
        method: 'GET',
        url: url,
        headers: {
          'Authorization': `Bearer ${this.siliconflowApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // 返回模型列表
      return {
        success: true,
        data: response.data?.data || [],
        total: response.data?.data?.length || 0
      };

    } catch (error: any) {
      this.logger.error('获取模型列表错误', {
        error: error.response?.data || error.message
      });

      return {
        success: false,
        error: '获取模型列表失败',
        message: error.response?.data?.error || error.message,
        data: [],
        total: 0
      };
    }
  }

  /**
   * 根据规则类型获取相应的消息管理器
   */
  private getMessageManager(ruleType: RuleType): MessageManagerService | VueCodeManagerService {
    switch (ruleType) {
      case 'default':
        return this.vueCodeManagerService;
      case 'programming':
        this.messageManagerService.setStrategy(messageConfig.PROGRAMMING_STRATEGY);
        return this.messageManagerService;
      case 'customer_service':
        this.messageManagerService.setStrategy(messageConfig.CUSTOMER_SERVICE_STRATEGY);
        return this.messageManagerService;
      default:
        this.messageManagerService.setStrategy(messageConfig.DEFAULT_STRATEGY);
        return this.messageManagerService;
    }
  }

  /**
   * 验证规则类型
   */
  validateRuleType(ruleType: string): boolean {
    return this.systemRulesService.isValidRuleType(ruleType);
  }

  /**
   * 获取所有可用的规则类型
   */
  getAvailableRuleTypes(): RuleType[] {
    return this.systemRulesService.getAvailableRuleTypes();
  }

  /**
   * 获取规则描述
   */
  getRuleDescription(ruleType: RuleType): string {
    return this.systemRulesService.getRuleDescription(ruleType);
  }

  /**
   * 估算消息token数量
   */
  estimateTokens(messages: ChatMessage[]): number {
    // 这里可以直接使用TokenEstimator，但为了封装性，通过MessageManager来估算
    return this.messageManagerService.getManagementInfo(messages, messages).originalTokens;
  }

  /**
   * 运行 Coze 工作流（非流式）
   */
  async runCozeWorkflow(workflowDto: CozeWorkflowRunDto): Promise<CozeWorkflowResponseDto> {
    try {
      if (!this.cozeApiKey) {
        throw new Error('Coze API Key 未配置');
      }

      const { workflow_id, input, stream } = workflowDto;

      // 构建请求参数
      const requestData = {
        parameters: {
          input: input?.query || "",
        },
        stream: stream || false,
        workflow_id: workflow_id || "7550483940001251364",
        app_id: "7496748337581310015"
      };

      this.logger.info('运行 Coze 工作流', {
        workflow_id,
        hasInput: !!input,
        stream: stream || false
      });
      console.log("requestData", requestData);
      // 发起请求到 Coze API
      const response = await axios({
        method: 'POST',
        url: `${this.cozeBaseUrl}run`,
        headers: {
          'Authorization': `Bearer ${this.cozeApiKey}`,
          'Content-Type': 'application/json'
        },
        data: requestData
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error: any) {
      this.logger.error('Coze 工作流运行错误', {
        error: error.response?.data || error.message,
        workflow_id: workflowDto.workflow_id
      });

      return {
        success: false,
        error: 'Coze 工作流运行失败',
        message: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * 运行 Coze 工作流（流式）
   */
  async runCozeWorkflowStream(workflowDto: CozeWorkflowStreamRunDto): Promise<AxiosResponse> {
    try {
      if (!this.cozeApiKey) {
        throw new Error('Coze API Key 未配置');
      }

      const { workflow_id, input } = workflowDto;

      // 构建请求参数
      const requestData = {
        parameters: {
          input: input?.query || "",
        },
        workflow_id: workflow_id || "7550483940001251364",
        app_id: "7496748337581310015"
      };

      this.logger.info('运行 Coze 工作流（流式）', {
        workflow_id,
        hasInput: !!input
      });

      // 发起流式请求到 Coze API
      const response = await axios({
        method: 'POST',
        url: `${this.cozeBaseUrl}stream_run`,
        headers: {
          'Authorization': `Bearer ${this.cozeApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        data: requestData,
        responseType: 'stream'
      });

      return response;

    } catch (error: any) {
      this.logger.error('Coze 工作流流式运行错误', {
        error: error.response?.data || error.message,
        workflow_id: workflowDto.workflow_id
      });
      throw error;
    }
  }
}
