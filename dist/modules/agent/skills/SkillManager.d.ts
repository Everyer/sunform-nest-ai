export interface SkillMetadata {
    name: string;
    description: string;
    displayName?: string;
    allowedTools?: string[];
    whenToUse?: string;
    version?: string;
    content: string;
    filePath: string;
}
export declare class SkillManager {
    private readonly skillsDir;
    constructor(skillsDir: string);
    listSkills(): Promise<SkillMetadata[]>;
    getSkill(name: string): Promise<SkillMetadata | null>;
    saveSkill(name: string, content: string): Promise<{
        success: boolean;
    }>;
    deleteSkill(name: string): Promise<{
        success: boolean;
    }>;
    private parseSkillMarkdown;
    getActiveSkills(userMessage: string): Promise<string[]>;
}
