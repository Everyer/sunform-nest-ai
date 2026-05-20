import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ToolUseContext } from './mcp/McpManager';
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: number;
    attachments?: {
        name: string;
        path: string;
        isImage?: boolean;
        content?: string;
        url?: string;
    }[];
    toolCalls?: any[];
    toolCallId?: string;
    toolName?: string;
    displayContent?: string;
}
export interface ToolCall {
    id: string;
    name: string;
    input: Record<string, any>;
    result?: any;
    error?: string;
    _raw?: any;
}
export interface StreamEvent {
    type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error';
    content?: string;
    isReasoning?: boolean;
    toolCall?: ToolCall;
    error?: string;
}
export type McpServerConfig = {
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    type: 'stdio' | 'sse' | 'http';
};
export declare class FileStateCache {
    private cache;
    constructor(maxEntries?: number, maxSizeBytes?: number);
    get(key: string): {
        content: string;
        timestamp: number;
        offset?: number;
        limit?: number;
    } | undefined;
    set(key: string, value: {
        content: string;
        timestamp: number;
        offset?: number;
        limit?: number;
    }): this;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
}
export declare abstract class BaseTool {
    abstract name: string;
    abstract description: string;
    abstract parameters: Record<string, any>;
    abstract inputSchema: any;
    isConcurrencySafe(_input: any): boolean;
    abstract execute(input: any, context: ToolUseContext): Promise<any>;
}
export declare class ReadTool extends BaseTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            file_path: {
                type: string;
                description: string;
            };
            offset: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    inputSchema: {
        parse: (input: any) => {
            file_path: string;
            offset: number | undefined;
            limit: number | undefined;
        };
    };
    isConcurrencySafe(): boolean;
    execute(input: {
        file_path: string;
        offset?: number;
        limit?: number;
    }, context: ToolUseContext): Promise<{
        success: boolean;
        error: string;
        content?: undefined;
        filePath?: undefined;
        lines?: undefined;
        totalLines?: undefined;
        truncated?: undefined;
    } | {
        success: boolean;
        content: string;
        filePath: string;
        lines: number;
        totalLines: number;
        truncated: boolean;
        error?: undefined;
    }>;
}
export declare class EditTool extends BaseTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            file_path: {
                type: string;
                description: string;
            };
            old_string: {
                type: string;
                description: string;
            };
            new_string: {
                type: string;
                description: string;
            };
            replace_all: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    inputSchema: {
        parse: (input: any) => {
            file_path: string;
            old_string: string;
            new_string: string;
            replace_all: boolean | undefined;
        };
    };
    execute(input: {
        file_path: string;
        old_string: string;
        new_string: string;
        replace_all?: boolean;
    }, context: ToolUseContext): Promise<{
        success: boolean;
        error: string;
        filePath?: undefined;
        replacedCount?: undefined;
    } | {
        success: boolean;
        filePath: string;
        replacedCount: number;
        error?: undefined;
    }>;
    private findActualString;
    private normalizeQuotes;
}
export declare class WriteTool extends BaseTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            file_path: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    inputSchema: {
        parse: (input: any) => {
            file_path: string;
            content: string;
        };
    };
    execute(input: {
        file_path: string;
        content: string;
    }, context: ToolUseContext): Promise<{
        success: boolean;
        filePath: string;
        bytesWritten: number;
    }>;
}
export declare class BashTool extends BaseTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            command: {
                type: string;
                description: string;
            };
            timeout: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    inputSchema: {
        parse: (input: any) => {
            command: string;
            timeout: number | undefined;
        };
    };
    isConcurrencySafe(): boolean;
    execute(input: {
        command: string;
        timeout?: number;
    }, context: ToolUseContext): Promise<any>;
}
export declare class GrepTool extends BaseTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            pattern: {
                type: string;
                description: string;
            };
            file_path: {
                type: string;
                description: string;
            };
            case_insensitive: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    inputSchema: {
        parse: (input: any) => {
            pattern: string;
            file_path: string | undefined;
            case_insensitive: boolean | undefined;
        };
    };
    isConcurrencySafe(): boolean;
    execute(input: {
        pattern: string;
        file_path?: string;
        case_insensitive?: boolean;
    }, context: ToolUseContext): Promise<{
        success: boolean;
        results: {
            line: number;
            content: string;
        }[];
        filePath: string;
        matchCount: number;
        totalMatches?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        results: never[];
        totalMatches: number;
        filePath?: undefined;
        matchCount?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        results?: undefined;
        filePath?: undefined;
        matchCount?: undefined;
        totalMatches?: undefined;
    }>;
    private searchInLines;
}
export declare class GlobTool extends BaseTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            pattern: {
                type: string;
                description: string;
            };
            cwd: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    inputSchema: {
        parse: (input: any) => {
            pattern: string;
            cwd: string | undefined;
        };
    };
    isConcurrencySafe(): boolean;
    execute(input: {
        pattern: string;
        cwd?: string;
    }, context: ToolUseContext): Promise<{
        success: boolean;
        files: string[];
        count: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        files?: undefined;
        count?: undefined;
    }>;
    private glob;
    private matchPattern;
}
export declare class EnvTool extends BaseTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            command: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    inputSchema: {
        parse: (input: any) => {
            command: string;
        };
    };
    execute(input: {
        command: string;
    }, context: ToolUseContext): Promise<{
        success: boolean;
        message: string;
        currentSetupCommands: string[];
    }>;
}
export declare class ToolRegistry {
    private tools;
    constructor();
    register(tool: any): void;
    get(name: string): any;
    getAll(): any[];
    getNames(): string[];
}
export interface AgentSession {
    id: string;
    title: string;
    messages: Message[];
    abortController: AbortController;
    createdAt: number;
    skill?: string;
}
export declare class AgentService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private sessions;
    private toolRegistry;
    private mcpTools;
    private mcpManager;
    private skillManager;
    private eventEmitter;
    private readonly configPath;
    private llmConfig;
    private fileManageConfig;
    private readonly historyDir;
    private readonly attachmentsDir;
    private readonly skillsDir;
    private saveTimers;
    private forceMockMode;
    constructor();
    private loadConfigSync;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    refreshMcpTools(): Promise<void>;
    getToolRegistry(): ToolRegistry;
    getMcpConfigs(): Promise<any>;
    saveMcpConfigs(configs: any): Promise<void>;
    addMcpConfig(name: string, config: any): Promise<{
        success: boolean;
        configs: any;
    }>;
    deleteMcpConfig(name: string): Promise<{
        success: boolean;
        configs: any;
    }>;
    getLlmConfig(): Promise<{
        fileManageUrl: string;
        fileManageKey: string;
        apiKey: string;
        baseUrl: string;
        model: string;
    }>;
    updateLlmConfig(config: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
        fileManageUrl?: string;
        fileManageKey?: string;
    }): Promise<{
        success: boolean;
        config: {
            fileManageUrl: string;
            fileManageKey: string;
            apiKey: string;
            baseUrl: string;
            model: string;
        };
    }>;
    private saveConfig;
    listSkills(): Promise<any[]>;
    private setupCleanupTask;
    createSession(): AgentSession;
    getSession(id: string): AgentSession | undefined;
    getSessions(): Map<string, AgentSession>;
    abortSession(id: string): void;
    closeSession(id: string): Promise<void>;
    private scheduleSaveSession;
    private saveSessionImmediate;
    listHistory(): Promise<any[]>;
    loadHistory(id: string): Promise<AgentSession | null>;
    deleteHistory(id: string): Promise<{
        success: boolean;
    }>;
    clearAllHistory(): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    processMessage(sessionId: string, userMessage: string, sourceCode?: string, skill?: string, formFields?: any[], flowNodes?: any[], fieldPermissions?: any, attachments?: {
        name: string;
        path: string;
    }[], availableActions?: string[]): AsyncGenerator<StreamEvent, void, unknown>;
    private processWithMockLLM;
    private makeMockContext;
    private processWithLLM;
    private buildMessages;
    private buildSystemPrompt;
    private loadSkillPromptSync;
    private executeToolCall;
    private callLLMStream;
    private estimateTokenCount;
    private summarizeConversation;
    private generateSessionTitle;
    private generateSessionTitleFromLLM;
    uploadFileToService(filePath: string, originalName: string): Promise<string>;
    private generateId;
}
