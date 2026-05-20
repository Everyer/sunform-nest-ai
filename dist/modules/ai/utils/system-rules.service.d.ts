export type RuleType = 'default' | 'programming' | 'customer_service' | 'custom';
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare class SystemRulesService {
    private readonly SYSTEM_RULES;
    private getSystemRuleContent;
    getSystemMessage(ruleType?: RuleType, customContent?: string): ChatMessage;
    addSystemRules(messages: ChatMessage[], ruleType?: RuleType, customContent?: string): ChatMessage[];
    updateSystemRules(messages: ChatMessage[], ruleType?: RuleType, customContent?: string): ChatMessage[];
    isValidRuleType(ruleType: string): ruleType is RuleType;
    getAvailableRuleTypes(): RuleType[];
    getRuleDescription(ruleType: RuleType): string;
}
