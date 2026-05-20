import { RuleType } from '../utils/system-rules.service';
export declare class ChatMessageDto {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare class StreamChatDto {
    messages: ChatMessageDto[];
    model?: string;
    ruleType?: RuleType;
    customRules?: string;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}
export declare class CompletionChatDto {
    messages: ChatMessageDto[];
    model?: string;
    ruleType?: RuleType;
    customRules?: string;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}
export declare class GetModelsDto {
    type?: string;
    sub_type?: string;
}
export declare class BaseResponseDto<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    total?: number;
}
export declare class ModelInfo {
    id: string;
    name: string;
    description?: string;
    type?: string;
    sub_type?: string;
}
export declare class GetModelsResponseDto extends BaseResponseDto<ModelInfo[]> {
    data: ModelInfo[];
}
export declare class CozeWorkflowRunDto {
    workflow_id: string;
    input?: Record<string, any>;
    stream?: boolean;
}
export declare class CozeWorkflowStreamRunDto {
    workflow_id: string;
    input?: Record<string, any>;
}
export declare class CozeWorkflowResponseDto extends BaseResponseDto {
    data?: {
        id: string;
        status: string;
        result?: any;
        created_at: number;
        finished_at?: number;
    };
}
