import { Response, Request } from 'express';
import { AiService } from './ai.service';
import { AiLoggerService } from './utils/logger.service';
import { StreamChatDto, CompletionChatDto, GetModelsDto, BaseResponseDto, GetModelsResponseDto, CozeWorkflowRunDto, CozeWorkflowStreamRunDto, CozeWorkflowResponseDto } from './dto/chat.dto';
export declare class AiController {
    private readonly aiService;
    private readonly logger;
    constructor(aiService: AiService, logger: AiLoggerService);
    streamChat(streamChatDto: StreamChatDto, res: Response, req: Request): Promise<void>;
    completionChat(completionChatDto: CompletionChatDto): Promise<any>;
    getModels(getModelsDto: GetModelsDto): Promise<GetModelsResponseDto>;
    getRuleTypes(): Promise<BaseResponseDto>;
    estimateTokens(body: {
        messages: any[];
    }): Promise<BaseResponseDto>;
    runCozeWorkflow(workflowDto: CozeWorkflowRunDto): Promise<CozeWorkflowResponseDto>;
    runCozeWorkflowStream(workflowDto: CozeWorkflowStreamRunDto, res: Response, req: Request): Promise<void>;
}
