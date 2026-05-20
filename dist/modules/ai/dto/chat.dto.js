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
exports.CozeWorkflowResponseDto = exports.CozeWorkflowStreamRunDto = exports.CozeWorkflowRunDto = exports.GetModelsResponseDto = exports.ModelInfo = exports.BaseResponseDto = exports.GetModelsDto = exports.CompletionChatDto = exports.StreamChatDto = exports.ChatMessageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ChatMessageDto {
}
exports.ChatMessageDto = ChatMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '消息角色',
        enum: ['system', 'user', 'assistant'],
        example: 'user'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['system', 'user', 'assistant']),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '消息内容',
        example: '请帮我生成一个Vue3的登录组件'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "content", void 0);
class StreamChatDto {
    constructor() {
        this.model = 'deepseek-ai/DeepSeek-V3';
        this.ruleType = 'default';
        this.max_tokens = 10000;
    }
}
exports.StreamChatDto = StreamChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '消息列表',
        type: [ChatMessageDto],
        example: [
            { role: 'user', content: '请帮我生成一个Vue3的登录组件' }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChatMessageDto),
    __metadata("design:type", Array)
], StreamChatDto.prototype, "messages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '使用的AI模型',
        example: 'deepseek-ai/DeepSeek-V3',
        default: 'deepseek-ai/DeepSeek-V3'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StreamChatDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '规则类型',
        enum: ['default', 'programming', 'customer_service', 'custom', 'lowcode'],
        example: 'default',
        default: 'default'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['default', 'programming', 'customer_service', 'custom', 'lowcode']),
    __metadata("design:type", String)
], StreamChatDto.prototype, "ruleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '自定义规则内容（当ruleType为custom时使用）',
        example: '你是一个专业的代码审查助手...'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StreamChatDto.prototype, "customRules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最大生成token数',
        example: 10000,
        default: 10000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StreamChatDto.prototype, "max_tokens", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '温度参数，控制生成的随机性',
        example: 0.7,
        minimum: 0,
        maximum: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StreamChatDto.prototype, "temperature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Top-p采样参数',
        example: 0.9,
        minimum: 0,
        maximum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StreamChatDto.prototype, "top_p", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '频率惩罚参数',
        example: 0,
        minimum: -2,
        maximum: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StreamChatDto.prototype, "frequency_penalty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '存在惩罚参数',
        example: 0,
        minimum: -2,
        maximum: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StreamChatDto.prototype, "presence_penalty", void 0);
class CompletionChatDto {
    constructor() {
        this.model = 'Qwen/QwQ-32B';
        this.ruleType = 'default';
        this.max_tokens = 4000;
    }
}
exports.CompletionChatDto = CompletionChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '消息列表',
        type: [ChatMessageDto],
        example: [
            { role: 'user', content: '请帮我生成一个Vue3的登录组件' }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChatMessageDto),
    __metadata("design:type", Array)
], CompletionChatDto.prototype, "messages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '使用的AI模型',
        example: 'Qwen/QwQ-32B',
        default: 'Qwen/QwQ-32B'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompletionChatDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '规则类型',
        enum: ['default', 'programming', 'customer_service', 'custom'],
        example: 'default',
        default: 'default'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['default', 'programming', 'customer_service', 'custom']),
    __metadata("design:type", String)
], CompletionChatDto.prototype, "ruleType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '自定义规则内容（当ruleType为custom时使用）',
        example: '你是一个专业的代码审查助手...'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompletionChatDto.prototype, "customRules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最大生成token数',
        example: 4000,
        default: 4000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompletionChatDto.prototype, "max_tokens", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '温度参数，控制生成的随机性',
        example: 0.7,
        minimum: 0,
        maximum: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompletionChatDto.prototype, "temperature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Top-p采样参数',
        example: 0.9,
        minimum: 0,
        maximum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompletionChatDto.prototype, "top_p", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '频率惩罚参数',
        example: 0,
        minimum: -2,
        maximum: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompletionChatDto.prototype, "frequency_penalty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '存在惩罚参数',
        example: 0,
        minimum: -2,
        maximum: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompletionChatDto.prototype, "presence_penalty", void 0);
class GetModelsDto {
}
exports.GetModelsDto = GetModelsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '模型类型过滤',
        example: 'chat',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetModelsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '模型子类型过滤',
        example: 'completion',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetModelsDto.prototype, "sub_type", void 0);
class BaseResponseDto {
}
exports.BaseResponseDto = BaseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '是否成功',
        example: true
    }),
    __metadata("design:type", Boolean)
], BaseResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '响应数据'
    }),
    __metadata("design:type", Object)
], BaseResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '错误信息'
    }),
    __metadata("design:type", String)
], BaseResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '详细错误信息'
    }),
    __metadata("design:type", String)
], BaseResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '数据总数'
    }),
    __metadata("design:type", Number)
], BaseResponseDto.prototype, "total", void 0);
class ModelInfo {
}
exports.ModelInfo = ModelInfo;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '模型ID',
        example: 'deepseek-ai/DeepSeek-V3'
    }),
    __metadata("design:type", String)
], ModelInfo.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '模型名称',
        example: 'DeepSeek-V3'
    }),
    __metadata("design:type", String)
], ModelInfo.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '模型描述'
    }),
    __metadata("design:type", String)
], ModelInfo.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '模型类型'
    }),
    __metadata("design:type", String)
], ModelInfo.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '模型子类型'
    }),
    __metadata("design:type", String)
], ModelInfo.prototype, "sub_type", void 0);
class GetModelsResponseDto extends BaseResponseDto {
}
exports.GetModelsResponseDto = GetModelsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '模型列表',
        type: [ModelInfo]
    }),
    __metadata("design:type", Array)
], GetModelsResponseDto.prototype, "data", void 0);
class CozeWorkflowRunDto {
    constructor() {
        this.stream = false;
    }
}
exports.CozeWorkflowRunDto = CozeWorkflowRunDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '工作流ID',
        example: 'workflow_12345'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CozeWorkflowRunDto.prototype, "workflow_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '工作流输入参数',
        example: {
            query: '帮我生成一个Vue组件',
            user_id: 'user123'
        }
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CozeWorkflowRunDto.prototype, "input", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否启用流式响应',
        example: true,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CozeWorkflowRunDto.prototype, "stream", void 0);
class CozeWorkflowStreamRunDto {
}
exports.CozeWorkflowStreamRunDto = CozeWorkflowStreamRunDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '工作流ID',
        example: 'workflow_12345'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CozeWorkflowStreamRunDto.prototype, "workflow_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '工作流输入参数',
        example: {
            query: '帮我生成一个Vue组件',
            user_id: 'user123'
        }
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CozeWorkflowStreamRunDto.prototype, "input", void 0);
class CozeWorkflowResponseDto extends BaseResponseDto {
}
exports.CozeWorkflowResponseDto = CozeWorkflowResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '工作流执行结果'
    }),
    __metadata("design:type", Object)
], CozeWorkflowResponseDto.prototype, "data", void 0);
//# sourceMappingURL=chat.dto.js.map