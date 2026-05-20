export interface McpServerConfig {
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    type: "stdio" | "sse" | "http";
}
export interface ToolUseContext {
    cwd: string;
    sessionId: string;
    readFileState: any;
    abortController: AbortController;
    setupCommands: string[];
    addSetupCommand: (cmd: string) => void;
    setInProgressToolUseIDs: (f: (prev: Set<string>) => Set<string>) => void;
    emit: (event: string, data: any) => void;
}
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
    inputSchema: {
        parse: (input: any) => any;
    };
    execute: (input: any, context: ToolUseContext) => Promise<any>;
    isConcurrencySafe?: (input: any) => boolean;
}
export declare class McpManager {
    private readonly logger;
    private clients;
    private readonly mcpConfigFile;
    constructor(configDir: string);
    init(): Promise<void>;
    private getConfigs;
    connectServer(name: string, config: McpServerConfig): Promise<void>;
    disconnectServer(name: string): Promise<void>;
    getAllTools(): Promise<ToolDefinition[]>;
    shutdown(): Promise<void>;
}
