import { ChatMessage } from './system-rules.service';
export interface ContinuationContext {
    finishReason: string;
    messages: ChatMessage[];
    model?: string;
}
export interface ContinuationDecision {
    shouldContinue: boolean;
    confidence: number;
    reason: string;
    continuationPrompt?: string;
}
export declare class ContinuationDetectorService {
    shouldContinue(context: ContinuationContext): ContinuationDecision;
}
