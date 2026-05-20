import * as fs from "fs/promises";
import * as path from "path";

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

export class SkillManager {
  private readonly skillsDir: string;

  constructor(skillsDir: string) {
    this.skillsDir = skillsDir;
  }

  async listSkills(): Promise<SkillMetadata[]> {
    const skills: SkillMetadata[] = [];
    try {
      const files = await fs.readdir(this.skillsDir);
      for (const file of files) {
        if (file.endsWith(".md")) {
          const content = await fs.readFile(path.join(this.skillsDir, file), "utf-8");
          const meta = this.parseSkillMarkdown(content, file);
          skills.push(meta);
        } else if (file.endsWith(".js") || file.endsWith(".ts")) {
          if (file.endsWith(".d.ts")) continue;
          const fullPath = path.join(this.skillsDir, file);
          try {
            delete require.cache[require.resolve(fullPath)];
            const mod = require(fullPath);
            const skillObj = mod.skill || mod.default;
            if (skillObj && skillObj.name) {
              skills.push({
                ...skillObj,
                filePath: fullPath
              });
            }
          } catch (e) {
            console.error(`Failed to load skill module ${file}:`, e);
          }
        }
      }
    } catch {}
    return skills;
  }

  async getSkill(name: string): Promise<SkillMetadata | null> {
    // Try to load as JS/TS module first
    for (const ext of ['.js', '.ts']) {
      try {
        const fullPath = path.join(this.skillsDir, `${name.replace(/\.(md|ts|js)$/, '')}.skill${ext}`);
        if (await fs.stat(fullPath).catch(() => null)) {
          delete require.cache[require.resolve(fullPath)];
          const mod = require(fullPath);
          const skillObj = mod.skill || mod.default;
          if (skillObj) return { ...skillObj, filePath: fullPath };
        }
      } catch (e) {}
    }

    // Fallback to Markdown
    const filename = name.endsWith(".md") ? name : `${name}.md`;
    try {
      const content = await fs.readFile(path.join(this.skillsDir, filename), "utf-8");
      return this.parseSkillMarkdown(content, filename);
    } catch {
      return null;
    }
  }

  async saveSkill(name: string, content: string) {
    const filename = name.endsWith(".md") ? name : `${name}.md`;
    await fs.mkdir(this.skillsDir, { recursive: true });
    await fs.writeFile(path.join(this.skillsDir, filename), content);
    return { success: true };
  }

  async deleteSkill(name: string) {
    const filename = name.endsWith(".md") ? name : `${name}.md`;
    await fs.unlink(path.join(this.skillsDir, filename));
    return { success: true };
  }

  private parseSkillMarkdown(content: string, filename: string): SkillMetadata {
    const meta: SkillMetadata = {
      name: filename.replace(".md", ""),
      description: "",
      content: content,
      filePath: path.join(this.skillsDir, filename),
    };

    const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
    if (match) {
      const yamlStr = match[1];
      const lines = yamlStr.split("\n");
      for (const line of lines) {
        const [k, ...v] = line.split(":");
        if (k && v.length) {
          const val = v.join(":").trim();
          const key = k.trim().toLowerCase();
          if (key === "name") meta.displayName = val;
          if (key === "description") meta.description = val;
          if (key === "triggers") (meta as any).triggers = val.split(",").map((s: string) => s.trim());
          if (key === "autobuild") (meta as any).autoBuild = val === "true";
        }
      }
      meta.content = content.replace(match[0], "").trim();
    }
    return meta;
  }

  async getActiveSkills(userMessage: string): Promise<string[]> {
    const allSkills = await this.listSkills();
    const activeSkillContents: string[] = [];

    const lowerMsg = userMessage.toLowerCase();

    for (const skill of allSkills) {
      const meta = skill as any;
      let shouldActivate = meta.autoBuild === true;

      if (!shouldActivate && meta.triggers) {
        for (const trigger of meta.triggers) {
          if (lowerMsg.includes(trigger.toLowerCase())) {
            shouldActivate = true;
            break;
          }
        }
      }

      if (shouldActivate) {
        activeSkillContents.push(`### 技能: ${skill.displayName || skill.name}\n${skill.content}`);
      }
    }

    return activeSkillContents;
  }
}
