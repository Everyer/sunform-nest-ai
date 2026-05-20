import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ContinuationDetectorService {
  
  /**
   * 判断是否需要续写
   */
  shouldContinue(context: ContinuationContext): ContinuationDecision {
    const { finishReason } = context;
    
    // 基于 finish_reason 判断
    if (finishReason === 'length') {
      return {
        shouldContinue: true,
        confidence: 0.95,
        reason: 'AI响应因长度限制被截断，需要续写',
        continuationPrompt: '请继续上面的内容'
      };
    }
    
    if (finishReason === 'stop') {
      return {
        shouldContinue: false,
        confidence: 0.95,
        reason: 'AI响应自然结束，无需续写'
      };
    }
    
    // 其他情况（如 null、undefined 等）默认不续写
    return {
      shouldContinue: false,
      confidence: 0.8,
      reason: `未知的结束原因: ${finishReason}，默认不续写`
    };
  }

}
