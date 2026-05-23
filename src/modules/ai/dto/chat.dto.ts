import { IsString, IsArray, IsOptional, IsNumber, IsBoolean, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RuleType } from '../utils/system-rules.service';

/**
 * 聊天消息DTO
 */
export class ChatMessageDto {
  @ApiProperty({
    description: '消息角色',
    enum: ['system', 'user', 'assistant'],
    example: 'user'
  })
  @IsString()
  @IsIn(['system', 'user', 'assistant'])
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({
    description: '消息内容',
    example: '请帮我生成一个Vue3的登录组件'
  })
  @IsString()
  content: string;
}

/**
 * 流式聊天请求DTO
 */
export class StreamChatDto {
  @ApiProperty({
    description: '消息列表',
    type: [ChatMessageDto],
    example: [
      { role: 'user', content: '请帮我生成一个Vue3的登录组件' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiPropertyOptional({
    description: '使用的AI模型',
    example: 'deepseek-ai/DeepSeek-V3',
    default: 'deepseek-ai/DeepSeek-V3'
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: '规则类型',
    enum: ['default', 'programming', 'customer_service', 'custom', 'lowcode'],
    example: 'default',
    default: 'default'
  })
  @IsOptional()
  @IsString()
  @IsIn(['default', 'programming', 'customer_service', 'custom', 'lowcode'])
  ruleType?: RuleType = 'default';

  @ApiPropertyOptional({
    description: '自定义规则内容（当ruleType为custom时使用）',
    example: '你是一个专业的代码审查助手...'
  })
  @IsOptional()
  @IsString()
  customRules?: string;

  @ApiPropertyOptional({
    description: '最大生成token数',
    example: 10000,
    default: 10000
  })
  @IsOptional()
  @IsNumber()
  max_tokens?: number = 10000;

  @ApiPropertyOptional({
    description: '温度参数，控制生成的随机性',
    example: 0.7,
    minimum: 0,
    maximum: 2
  })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Top-p采样参数',
    example: 0.9,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  top_p?: number;

  @ApiPropertyOptional({
    description: '频率惩罚参数',
    example: 0,
    minimum: -2,
    maximum: 2
  })
  @IsOptional()
  @IsNumber()
  frequency_penalty?: number;

  @ApiPropertyOptional({
    description: '存在惩罚参数',
    example: 0,
    minimum: -2,
    maximum: 2
  })
  @IsOptional()
  @IsNumber()
  presence_penalty?: number;
}

/**
 * 非流式聊天请求DTO
 */
export class CompletionChatDto {
  @ApiProperty({
    description: '消息列表',
    type: [ChatMessageDto],
    example: [
      { role: 'user', content: '请帮我生成一个Vue3的登录组件' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiPropertyOptional({
    description: '使用的AI模型',
    example: 'Qwen/QwQ-32B',
    default: 'Qwen/QwQ-32B'
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: '规则类型',
    enum: ['default', 'programming', 'customer_service', 'custom'],
    example: 'default',
    default: 'default'
  })
  @IsOptional()
  @IsString()
  @IsIn(['default', 'programming', 'customer_service', 'custom'])
  ruleType?: RuleType = 'default';

  @ApiPropertyOptional({
    description: '自定义规则内容（当ruleType为custom时使用）',
    example: '你是一个专业的代码审查助手...'
  })
  @IsOptional()
  @IsString()
  customRules?: string;

  @ApiPropertyOptional({
    description: '最大生成token数',
    example: 4000,
    default: 4000
  })
  @IsOptional()
  @IsNumber()
  max_tokens?: number = 4000;

  @ApiPropertyOptional({
    description: '温度参数，控制生成的随机性',
    example: 0.7,
    minimum: 0,
    maximum: 2
  })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Top-p采样参数',
    example: 0.9,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  top_p?: number;

  @ApiPropertyOptional({
    description: '频率惩罚参数',
    example: 0,
    minimum: -2,
    maximum: 2
  })
  @IsOptional()
  @IsNumber()
  frequency_penalty?: number;

  @ApiPropertyOptional({
    description: '存在惩罚参数',
    example: 0,
    minimum: -2,
    maximum: 2
  })
  @IsOptional()
  @IsNumber()
  presence_penalty?: number;
}

/**
 * 获取模型列表请求DTO
 */
export class GetModelsDto {
  @ApiPropertyOptional({
    description: '模型类型过滤',
    example: 'chat',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: '模型子类型过滤',
    example: 'completion',
  })
  @IsOptional()
  @IsString()
  sub_type?: string;
}

/**
 * API响应基础结构
 */
export class BaseResponseDto<T = any> {
  @ApiProperty({
    description: '是否成功',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: '响应数据'
  })
  data?: T;

  @ApiProperty({
    description: '错误信息'
  })
  error?: string;

  @ApiProperty({
    description: '详细错误信息'
  })
  message?: string;

  @ApiProperty({
    description: '数据总数'
  })
  total?: number;
}

/**
 * 模型信息
 */
export class ModelInfo {
  @ApiProperty({
    description: '模型ID',
    example: 'deepseek-ai/DeepSeek-V3'
  })
  id: string;

  @ApiProperty({
    description: '模型名称',
    example: 'DeepSeek-V3'
  })
  name: string;

  @ApiProperty({
    description: '模型描述'
  })
  description?: string;

  @ApiProperty({
    description: '模型类型'
  })
  type?: string;

  @ApiProperty({
    description: '模型子类型'
  })
  sub_type?: string;
}

/**
 * 获取模型列表响应DTO
 */
export class GetModelsResponseDto extends BaseResponseDto<ModelInfo[]> {
  @ApiProperty({
    description: '模型列表',
    type: [ModelInfo]
  })
  data: ModelInfo[];
}

/**
 * Coze 工作流运行请求DTO
 */
export class CozeWorkflowRunDto {
  @ApiProperty({
    description: '工作流ID',
    example: 'workflow_12345'
  })
  @IsString()
  workflow_id: string;

  @ApiPropertyOptional({
    description: '工作流输入参数',
    example: {
      query: '帮我生成一个Vue组件',
      user_id: 'user123'
    }
  })
  @IsOptional()
  input?: Record<string, any>;

  @ApiPropertyOptional({
    description: '是否启用流式响应',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  stream?: boolean = false;
}

/**
 * Coze 工作流流式运行请求DTO
 */
export class CozeWorkflowStreamRunDto {
  @ApiProperty({
    description: '工作流ID',
    example: 'workflow_12345'
  })
  @IsString()
  workflow_id: string;

  @ApiPropertyOptional({
    description: '工作流输入参数',
    example: {
      query: '帮我生成一个Vue组件',
      user_id: 'user123'
    }
  })
  @IsOptional()
  input?: Record<string, any>;
}

/**
 * Coze 工作流响应DTO
 */
export class CozeWorkflowResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: '工作流执行结果'
  })
  data?: {
    id: string;
    status: string;
    result?: any;
    created_at: number;
    finished_at?: number;
  };
}
