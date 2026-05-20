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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const system_rules_service_1 = require("./utils/system-rules.service");
const message_manager_service_1 = require("./utils/message-manager.service");
const logger_service_1 = require("./utils/logger.service");
const continuation_detector_service_1 = require("./utils/continuation-detector.service");
const message_config_1 = require("./config/message.config");
let AiService = class AiService {
    constructor(configService, systemRulesService, messageManagerService, vueCodeManagerService, logger, continuationDetector) {
        this.configService = configService;
        this.systemRulesService = systemRulesService;
        this.messageManagerService = messageManagerService;
        this.vueCodeManagerService = vueCodeManagerService;
        this.logger = logger;
        this.continuationDetector = continuationDetector;
        this.siliconflowApiKey = this.configService.get('SILICONFLOW_API_KEY') ||
            'sk-rrjepjyxesmokrgnqrzjikqegxftuuqcllczhwsrpmvtsypu';
        this.siliconflowBaseUrl = this.configService.get('SILICONFLOW_BASE_URL') ||
            'https://api.siliconflow.cn/v1';
        this.cozeApiKey = this.configService.get('COZE_API_KEY') || 'pat_a7d9C2KTexEjWNmfdt22nQEZUqhkX1vd28We5b6W642hWrW9Awo7HtbupRlUJ5Uv';
        this.cozeBaseUrl = this.configService.get('COZE_BASE_URL') ||
            'https://api.coze.cn/v1/workflow/';
    }
    async streamChat(streamChatDto) {
        try {
            const { messages, model, ruleType, customRules, ...otherParams } = streamChatDto;
            const messagesWithRules = this.systemRulesService.addSystemRules(messages, ruleType || 'default', customRules);
            const messageManager = this.getMessageManager(ruleType || 'default');
            const systemMessage = messagesWithRules.find(msg => msg.role === 'system');
            const conversationMessages = messagesWithRules.filter(msg => msg.role !== 'system');
            const optimizedMessages = await messageManager.manageMessages(conversationMessages, systemMessage);
            console.log(ruleType);
            const managementInfo = messageManager.getManagementInfo(messagesWithRules, optimizedMessages);
            const requestData = {
                model: model || 'deepseek-ai/DeepSeek-V3',
                messages: optimizedMessages,
                stream: true,
                max_tokens: streamChatDto.max_tokens || 10000,
                ...otherParams
            };
            this.logger.logChatRequest({
                model: requestData.model,
                originalMessagesCount: messagesWithRules.length,
                optimizedMessagesCount: optimizedMessages.length,
                ruleType: ruleType || 'default',
                hasCustomRules: !!customRules,
                tokenOptimization: managementInfo,
            });
            return this.createSmartStreamResponse(requestData, optimizedMessages, model);
        }
        catch (error) {
            this.logger.error('流式聊天服务错误', error);
            throw error;
        }
    }
    async createSmartStreamResponse(requestData, messages, model) {
        const { PassThrough } = require('stream');
        const smartStream = new PassThrough();
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
        };
        this.handleSmartStreamResponse(requestData, messages, smartStream, model);
        return mockResponse;
    }
    async handleSmartStreamResponse(requestData, messages, outputStream, model) {
        try {
            let accumulatedContent = '';
            let finishReason = '';
            const response = await (0, axios_1.default)({
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
            response.data.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                outputStream.write(chunkStr);
                this.extractContentFromChunk(chunkStr, (content) => {
                    accumulatedContent += content;
                });
                const extractedFinishReason = this.extractFinishReasonFromChunk(chunkStr);
                if (extractedFinishReason) {
                    finishReason = extractedFinishReason;
                }
            });
            response.data.on('end', async () => {
                try {
                    const continuationContext = {
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
                        await this.performContinuation(messages, accumulatedContent, decision.continuationPrompt || '请继续', outputStream, requestData);
                    }
                    else {
                        outputStream.end();
                    }
                }
                catch (error) {
                    this.logger.error('续写判定错误', error);
                    outputStream.end();
                }
            });
            response.data.on('error', (error) => {
                this.logger.error('第一次响应流错误', error);
                outputStream.emit('error', error);
            });
        }
        catch (error) {
            this.logger.error('智能流响应处理错误', error);
            outputStream.emit('error', error);
        }
    }
    async performContinuation(originalMessages, previousContent, continuationPrompt, outputStream, originalRequestData) {
        try {
            const continuationMessages = [
                {
                    role: 'system',
                    content: this.generateContinuationSystemRule(previousContent)
                },
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
            const continuationRequestData = {
                ...originalRequestData,
                messages: continuationMessages,
                max_tokens: Math.min(originalRequestData.max_tokens || 5000, 3000)
            };
            this.logger.info('开始续写', {
                originalContentLength: previousContent.length,
                continuationPrompt
            });
            const continuationResponse = await (0, axios_1.default)({
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
            continuationResponse.data.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                outputStream.write(chunkStr);
            });
            continuationResponse.data.on('end', () => {
                outputStream.end();
            });
            continuationResponse.data.on('error', (error) => {
                this.logger.error('续写响应流错误', error);
                outputStream.end();
            });
        }
        catch (error) {
            this.logger.error('续写执行错误', error);
            outputStream.end();
        }
    }
    extractContentFromChunk(chunkStr, callback) {
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
                    }
                    catch (parseError) {
                    }
                }
            }
        }
        catch (error) {
        }
    }
    extractFinishReasonFromChunk(chunkStr) {
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
                    }
                    catch (parseError) {
                    }
                }
            }
        }
        catch (error) {
        }
        return null;
    }
    generateOptimizedContinuationPrompt(previousContent, defaultPrompt) {
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
        return `请继续完成上面的内容，注意：
1. 不要重复任何已有内容
2. 从中断的地方自然接续
3. 保持风格和格式一致
4. 确保内容连贯完整
5. 如果是代码续写，不要添加代码块标记，直接输出代码内容
请继续：`;
    }
    isVueCode(content) {
        return /(<template>|<script|<style|\.vue|v-model|v-if|v-for|defineProps|defineEmits)/i.test(content);
    }
    isHtmlCode(content) {
        return /(<\/?\w+[^>]*>|<!DOCTYPE|<html|<head|<body)/i.test(content);
    }
    isJavaScriptCode(content) {
        return /(function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|class\s+\w+|import\s+.*from|export\s+)/i.test(content);
    }
    isArticleContent(content) {
        const chineseText = /[\u4e00-\u9fa5]+/g.test(content);
        const hasParagraphs = content.includes('\n\n') || content.length > 100;
        const noCodeMarkers = !/<[^>]+>/.test(content) && !/(function|const|let|var)\s+\w+/.test(content);
        return chineseText && hasParagraphs && noCodeMarkers;
    }
    generateContinuationSystemRule(previousContent) {
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
        return `你是一个专业的内容续写助手。你的任务是：
1. 从中断处自然接续内容
2. 不要重复任何已有内容
3. 保持风格和格式一致
4. 确保内容连贯完整
5. 如果是代码，不要添加代码块标记，直接输出纯代码`;
    }
    async completionChat(completionChatDto) {
        try {
            const { messages, model, ruleType, customRules, ...otherParams } = completionChatDto;
            const messagesWithRules = this.systemRulesService.addSystemRules(messages, ruleType || 'default', customRules);
            const messageManager = this.getMessageManager(ruleType || 'default');
            const systemMessage = messagesWithRules.find(msg => msg.role === 'system');
            const conversationMessages = messagesWithRules.filter(msg => msg.role !== 'system');
            const optimizedMessages = await messageManager.manageMessages(conversationMessages, systemMessage);
            const managementInfo = messageManager.getManagementInfo(messagesWithRules, optimizedMessages);
            const requestData = {
                model: model || 'Qwen/QwQ-32B',
                messages: optimizedMessages,
                stream: false,
                max_tokens: completionChatDto.max_tokens || 4000,
                ...otherParams
            };
            this.logger.logChatRequest({
                model: requestData.model,
                originalMessagesCount: messagesWithRules.length,
                optimizedMessagesCount: optimizedMessages.length,
                ruleType: ruleType || 'default',
                hasCustomRules: !!customRules,
                tokenOptimization: managementInfo,
            });
            const response = await (0, axios_1.default)({
                method: 'POST',
                url: `${this.siliconflowBaseUrl}/chat/completions`,
                headers: {
                    'Authorization': `Bearer ${this.siliconflowApiKey}`,
                    'Content-Type': 'application/json'
                },
                data: requestData
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('聊天完成请求错误', {
                error: error.response?.data || error.message
            });
            throw error;
        }
    }
    async getModels(getModelsDto) {
        try {
            const { type, sub_type } = getModelsDto;
            const queryParams = new URLSearchParams();
            if (type)
                queryParams.append('type', type);
            if (sub_type)
                queryParams.append('sub_type', sub_type);
            const queryString = queryParams.toString();
            const url = `${this.siliconflowBaseUrl}/models${queryString ? `?${queryString}` : ''}`;
            this.logger.info('获取模型列表', { type, sub_type, url });
            const response = await (0, axios_1.default)({
                method: 'GET',
                url: url,
                headers: {
                    'Authorization': `Bearer ${this.siliconflowApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data?.data || [],
                total: response.data?.data?.length || 0
            };
        }
        catch (error) {
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
    getMessageManager(ruleType) {
        switch (ruleType) {
            case 'default':
                return this.vueCodeManagerService;
            case 'programming':
                this.messageManagerService.setStrategy(message_config_1.messageConfig.PROGRAMMING_STRATEGY);
                return this.messageManagerService;
            case 'customer_service':
                this.messageManagerService.setStrategy(message_config_1.messageConfig.CUSTOMER_SERVICE_STRATEGY);
                return this.messageManagerService;
            default:
                this.messageManagerService.setStrategy(message_config_1.messageConfig.DEFAULT_STRATEGY);
                return this.messageManagerService;
        }
    }
    validateRuleType(ruleType) {
        return this.systemRulesService.isValidRuleType(ruleType);
    }
    getAvailableRuleTypes() {
        return this.systemRulesService.getAvailableRuleTypes();
    }
    getRuleDescription(ruleType) {
        return this.systemRulesService.getRuleDescription(ruleType);
    }
    estimateTokens(messages) {
        return this.messageManagerService.getManagementInfo(messages, messages).originalTokens;
    }
    async runCozeWorkflow(workflowDto) {
        try {
            if (!this.cozeApiKey) {
                throw new Error('Coze API Key 未配置');
            }
            const { workflow_id, input, stream } = workflowDto;
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
            const response = await (0, axios_1.default)({
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
        }
        catch (error) {
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
    async runCozeWorkflowStream(workflowDto) {
        try {
            if (!this.cozeApiKey) {
                throw new Error('Coze API Key 未配置');
            }
            const { workflow_id, input } = workflowDto;
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
            const response = await (0, axios_1.default)({
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
        }
        catch (error) {
            this.logger.error('Coze 工作流流式运行错误', {
                error: error.response?.data || error.message,
                workflow_id: workflowDto.workflow_id
            });
            throw error;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        system_rules_service_1.SystemRulesService,
        message_manager_service_1.MessageManagerService,
        message_manager_service_1.VueCodeManagerService,
        logger_service_1.AiLoggerService,
        continuation_detector_service_1.ContinuationDetectorService])
], AiService);
//# sourceMappingURL=ai.service.js.map