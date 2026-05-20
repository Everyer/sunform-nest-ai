import { Response } from 'express';
import { AgentService } from './agent.service';
export declare class AgentController {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    createSession(): {
        sessionId: string;
    };
    abortSession(dto: {
        sessionId: string;
    }): {
        success: boolean;
    };
    closeSession(dto: {
        sessionId: string;
    }): {
        success: boolean;
    };
    sendMessage(dto: {
        sessionId: string;
        content: string;
        sourceCode?: string;
        skill?: string;
        formFields?: any[];
        flowNodes?: any[];
        fieldPermissions?: any;
        attachments?: {
            name: string;
            path: string;
        }[];
        availableActions?: string[];
    }, res: Response): Promise<void>;
    listHistory(): Promise<any[]>;
    loadHistory(id: string): Promise<{
        error: string;
        sessionId?: undefined;
        title?: undefined;
        messages?: undefined;
    } | {
        sessionId: string;
        title: string;
        messages: import("./agent.service").Message[];
        error?: undefined;
    }>;
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
    getConfig(): Promise<{
        fileManageUrl: string;
        fileManageKey: string;
        apiKey: string;
        baseUrl: string;
        model: string;
    }>;
    updateConfig(body: any): Promise<{
        success: boolean;
        config: {
            fileManageUrl: string;
            fileManageKey: string;
            apiKey: string;
            baseUrl: string;
            model: string;
        };
    }>;
    getMcpConfigs(): Promise<any>;
    addMcpConfig(body: {
        name: string;
        config: any;
    }): Promise<{
        success: boolean;
        configs: any;
    }>;
    deleteMcpConfig(body: {
        name: string;
    }): Promise<{
        success: boolean;
        configs: any;
    }>;
    refreshMcpTools(): Promise<{
        success: boolean;
    }>;
    uploadFile(file: any): Promise<{
        success: boolean;
        name: any;
        path: any;
        url: string;
    }>;
}
