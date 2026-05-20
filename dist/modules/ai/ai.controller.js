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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const logger_service_1 = require("./utils/logger.service");
const chat_dto_1 = require("./dto/chat.dto");
let AiController = class AiController {
    constructor(aiService, logger) {
        this.aiService = aiService;
        this.logger = logger;
    }
    async streamChat(streamChatDto, res, req) {
        try {
            if (!streamChatDto.messages || !Array.isArray(streamChatDto.messages) || streamChatDto.messages.length === 0) {
                throw new common_1.HttpException({
                    error: '参数错误',
                    message: 'messages 参数必须是非空数组'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            for (const message of streamChatDto.messages) {
                if (!message.role || !message.content) {
                    throw new common_1.HttpException({
                        error: '参数错误',
                        message: '每条消息必须包含 role 和 content 字段'
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
            const streamResponse = await this.aiService.streamChat(streamChatDto);
            streamResponse.data.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                res.write(chunkStr);
            });
            streamResponse.data.on('end', () => {
                res.end();
            });
            streamResponse.data.on('error', (error) => {
                this.logger.error('流式响应错误', error);
                res.write(`data: {"error": "流式传输错误"}\n\n`);
                res.end();
            });
            req.on('close', () => {
                this.logger.info('客户端断开连接');
                if (streamResponse.data && typeof streamResponse.data.destroy === 'function') {
                    streamResponse.data.destroy();
                }
            });
        }
        catch (error) {
            this.logger.error('流式聊天控制器错误', error);
            if (!res.headersSent) {
                res.status(error.status || 500).json({
                    error: '服务器错误',
                    message: error.message || '未知错误'
                });
            }
        }
    }
    async completionChat(completionChatDto) {
        try {
            if (!completionChatDto.messages || !Array.isArray(completionChatDto.messages) || completionChatDto.messages.length === 0) {
                throw new common_1.HttpException({
                    error: '参数错误',
                    message: 'messages 参数必须是非空数组'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.aiService.completionChat(completionChatDto);
            return result;
        }
        catch (error) {
            this.logger.error('非流式聊天控制器错误', error);
            throw new common_1.HttpException({
                error: '服务器错误',
                message: error.message || '未知错误'
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getModels(getModelsDto) {
        try {
            return await this.aiService.getModels(getModelsDto);
        }
        catch (error) {
            this.logger.error('获取模型列表控制器错误', error);
            return {
                success: false,
                error: '获取模型列表失败',
                message: error.message || '未知错误',
                data: [],
                total: 0
            };
        }
    }
    async getRuleTypes() {
        try {
            const ruleTypes = this.aiService.getAvailableRuleTypes();
            const rules = ruleTypes.map(type => ({
                type,
                description: this.aiService.getRuleDescription(type)
            }));
            return {
                success: true,
                data: rules
            };
        }
        catch (error) {
            this.logger.error('获取规则类型错误', error);
            return {
                success: false,
                error: '获取规则类型失败',
                message: error.message || '未知错误'
            };
        }
    }
    async estimateTokens(body) {
        try {
            if (!body.messages || !Array.isArray(body.messages)) {
                throw new common_1.HttpException({
                    error: '参数错误',
                    message: 'messages 参数必须是数组'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const totalTokens = this.aiService.estimateTokens(body.messages);
            return {
                success: true,
                data: {
                    totalTokens,
                    messagesCount: body.messages.length
                }
            };
        }
        catch (error) {
            this.logger.error('Token估算错误', error);
            return {
                success: false,
                error: 'Token估算失败',
                message: error.message || '未知错误'
            };
        }
    }
    async runCozeWorkflow(workflowDto) {
        try {
            if (!workflowDto.workflow_id) {
                throw new common_1.HttpException({
                    error: '参数错误',
                    message: 'workflow_id 参数不能为空'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.aiService.runCozeWorkflow(workflowDto);
            return result;
        }
        catch (error) {
            this.logger.error('Coze 工作流运行控制器错误', error);
            throw new common_1.HttpException({
                error: '服务器错误',
                message: error.message || '未知错误'
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async runCozeWorkflowStream(workflowDto, res, req) {
        try {
            if (!workflowDto.workflow_id) {
                throw new common_1.HttpException({
                    error: '参数错误',
                    message: 'workflow_id 参数不能为空'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
            const streamResponse = await this.aiService.runCozeWorkflowStream(workflowDto);
            streamResponse.data.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                res.write(chunkStr);
            });
            streamResponse.data.on('end', () => {
                res.end();
            });
            streamResponse.data.on('error', (error) => {
                this.logger.error('Coze 工作流流式响应错误', error);
                res.write(`data: {"error": "流式传输错误"}\n\n`);
                res.end();
            });
            req.on('close', () => {
                this.logger.info('客户端断开连接');
                if (streamResponse.data && typeof streamResponse.data.destroy === 'function') {
                    streamResponse.data.destroy();
                }
            });
        }
        catch (error) {
            this.logger.error('Coze 工作流流式运行控制器错误', error);
            if (!res.headersSent) {
                res.status(error.status || 500).json({
                    error: '服务器错误',
                    message: error.message || '未知错误'
                });
            }
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('stream'),
    (0, swagger_1.ApiOperation)({
        summary: '流式聊天接口',
        description: '支持实时流式响应的AI聊天接口，适用于需要即时反馈的场景'
    }),
    (0, swagger_1.ApiBody)({
        type: chat_dto_1.StreamChatDto,
        description: '流式聊天请求参数'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '流式响应成功',
        schema: {
            type: 'string',
            format: 'text/event-stream'
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '参数错误',
        type: chat_dto_1.BaseResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '服务器错误',
        type: chat_dto_1.BaseResponseDto
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.StreamChatDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "streamChat", null);
__decorate([
    (0, common_1.Post)('completions'),
    (0, swagger_1.ApiOperation)({
        summary: '非流式聊天接口',
        description: '返回完整响应的AI聊天接口，适用于一次性获取完整回复的场景'
    }),
    (0, swagger_1.ApiBody)({
        type: chat_dto_1.CompletionChatDto,
        description: '非流式聊天请求参数'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '聊天成功',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                object: { type: 'string' },
                created: { type: 'number' },
                model: { type: 'string' },
                choices: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            index: { type: 'number' },
                            message: {
                                type: 'object',
                                properties: {
                                    role: { type: 'string' },
                                    content: { type: 'string' }
                                }
                            },
                            finish_reason: { type: 'string' }
                        }
                    }
                },
                usage: {
                    type: 'object',
                    properties: {
                        prompt_tokens: { type: 'number' },
                        completion_tokens: { type: 'number' },
                        total_tokens: { type: 'number' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '参数错误',
        type: chat_dto_1.BaseResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '服务器错误',
        type: chat_dto_1.BaseResponseDto
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.CompletionChatDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "completionChat", null);
__decorate([
    (0, common_1.Get)('models'),
    (0, swagger_1.ApiOperation)({
        summary: '获取可用模型列表',
        description: '获取硅基流动平台支持的AI模型列表'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        description: '模型类型过滤',
        example: 'chat'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sub_type',
        required: false,
        description: '模型子类型过滤',
        example: 'completion'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取模型列表成功',
        type: chat_dto_1.GetModelsResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '获取模型列表失败',
        type: chat_dto_1.BaseResponseDto
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.GetModelsDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({
        summary: '获取可用规则类型',
        description: '获取所有可用的AI对话规则类型及其描述'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取规则类型成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            type: { type: 'string' },
                            description: { type: 'string' }
                        }
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getRuleTypes", null);
__decorate([
    (0, common_1.Post)('estimate-tokens'),
    (0, swagger_1.ApiOperation)({
        summary: '估算消息Token数量',
        description: '估算给定消息列表将消耗的Token数量'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                messages: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            role: { type: 'string' },
                            content: { type: 'string' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token估算成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        totalTokens: { type: 'number' },
                        messagesCount: { type: 'number' }
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "estimateTokens", null);
__decorate([
    (0, common_1.Post)('coze/workflow/run'),
    (0, swagger_1.ApiOperation)({
        summary: '运行 Coze 工作流（非流式）',
        description: '运行指定的 Coze 工作流并返回完整结果'
    }),
    (0, swagger_1.ApiBody)({
        type: chat_dto_1.CozeWorkflowRunDto,
        description: 'Coze 工作流运行参数'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '工作流运行成功',
        type: chat_dto_1.CozeWorkflowResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '参数错误',
        type: chat_dto_1.BaseResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '服务器错误',
        type: chat_dto_1.BaseResponseDto
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.CozeWorkflowRunDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "runCozeWorkflow", null);
__decorate([
    (0, common_1.Post)('coze/workflow/stream'),
    (0, swagger_1.ApiOperation)({
        summary: '运行 Coze 工作流（流式）',
        description: '以流式方式运行指定的 Coze 工作流，支持实时响应'
    }),
    (0, swagger_1.ApiBody)({
        type: chat_dto_1.CozeWorkflowStreamRunDto,
        description: 'Coze 工作流流式运行参数'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '流式响应成功',
        schema: {
            type: 'string',
            format: 'text/event-stream'
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '参数错误',
        type: chat_dto_1.BaseResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '服务器错误',
        type: chat_dto_1.BaseResponseDto
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.CozeWorkflowStreamRunDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "runCozeWorkflowStream", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI聊天'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        logger_service_1.AiLoggerService])
], AiController);
//# sourceMappingURL=ai.controller.js.map