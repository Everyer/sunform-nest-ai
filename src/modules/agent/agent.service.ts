/**
 * Agent 核心服务（增强版）
 * 合并：内置工具系统 + MCP 工具 + 查询引擎 + 对话压缩 + .env 持久化
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { LRUCache } from 'lru-cache';
import { McpManager, ToolDefinition, ToolUseContext } from './mcp/McpManager';
import { SkillManager } from './skills/SkillManager';

// ========== 1. 类型定义 ==========

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  attachments?: { name: string; path: string; isImage?: boolean; content?: string; url?: string }[];
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

// ========== 2. 路径校验工具 ==========

function resolveAndValidatePath(basePath: string, targetPath: string): string {
  const normalizedBase = path.normalize(basePath);
  let target = targetPath;
  while (target.startsWith('/project/') || target.startsWith('project/')) {
    if (target.startsWith('/project/')) target = target.substring(9);
    else target = target.substring(8);
  }
  if (target === '/project' || target === 'project' || target === '/') target = '.';
  const fullPath = path.isAbsolute(target)
    ? path.normalize(target)
    : path.normalize(path.join(normalizedBase, target));
  if (!fullPath.startsWith(normalizedBase)) {
    throw new Error(`权限拒绝: 路径 ${targetPath} 超出项目操作范围`);
  }
  return fullPath;
}

// ========== 3. 文件状态缓存 ==========

export class FileStateCache {
  private cache: LRUCache<string, { content: string; timestamp: number; offset?: number; limit?: number }>;

  constructor(maxEntries = 100, maxSizeBytes = 25 * 1024 * 1024) {
    this.cache = new LRUCache({
      max: maxEntries,
      maxSize: maxSizeBytes,
      sizeCalculation: (value) => Math.max(1, Buffer.byteLength(value.content)),
    });
  }

  get(key: string) { return this.cache.get(path.normalize(key)); }
  set(key: string, value: { content: string; timestamp: number; offset?: number; limit?: number }) {
    this.cache.set(path.normalize(key), value); return this;
  }
  has(key: string) { return this.cache.has(path.normalize(key)); }
  delete(key: string) { return this.cache.delete(path.normalize(key)); }
  clear() { this.cache.clear(); }
}

// ========== 4. 工具基类 ==========

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: Record<string, any>;
  abstract inputSchema: any;
  isConcurrencySafe(_input: any): boolean { return false; }
  abstract execute(input: any, context: ToolUseContext): Promise<any>;
}

// ========== 5. 内置工具实现 ==========

/**
 * 读取文件工具
 */
export class ReadTool extends BaseTool {
  name = 'Read';
  description = '读取文件内容，支持 offset 和 limit';
  parameters = {
    type: 'object',
    properties: {
      file_path: { type: 'string', description: '要读取的文件路径' },
      offset: { type: 'number', description: '起始行号（可选）' },
      limit: { type: 'number', description: '限制读取行数（可选）' },
    },
    required: ['file_path'],
  };
  inputSchema = { parse: (input: any) => ({ file_path: input.file_path as string, offset: input.offset as number | undefined, limit: input.limit as number | undefined }) };
  isConcurrencySafe() { return true; }

  async execute(input: { file_path: string; offset?: number; limit?: number }, context: ToolUseContext) {
    const fullPath = resolveAndValidatePath(context.cwd, input.file_path);
    let content: string;
    try {
      content = await fs.readFile(fullPath, 'utf-8');
    } catch (e: any) {
      if (e.code === 'ENOENT') return { success: false, error: `文件不存在: ${input.file_path}` };
      throw e;
    }
    const lines = content.split('\n');
    const startLine = input.offset ?? 0;
    const endLine = input.limit !== undefined ? startLine + input.limit : undefined;
    const selectedLines = lines.slice(startLine, endLine);
    const finalContent = selectedLines.join('\n');
    try {
      context.readFileState.set(fullPath, { content: finalContent, timestamp: (await fs.stat(fullPath)).mtimeMs, offset: input.offset, limit: input.limit });
    } catch {}
    return { success: true, content: finalContent, filePath: input.file_path, lines: selectedLines.length, totalLines: lines.length, truncated: input.limit !== undefined && lines.length > input.limit };
  }
}

/**
 * 编辑文件工具（字符串匹配）
 */
export class EditTool extends BaseTool {
  name = 'Edit';
  description = '使用字符串匹配编辑文件';
  parameters = {
    type: 'object',
    properties: {
      file_path: { type: 'string', description: '要编辑的文件路径' },
      old_string: { type: 'string', description: '要替换的原字符串' },
      new_string: { type: 'string', description: '替换后的新字符串' },
      replace_all: { type: 'boolean', description: '是否替换所有匹配项（可选）' },
    },
    required: ['file_path', 'old_string', 'new_string'],
  };
  inputSchema = { parse: (input: any) => ({ file_path: input.file_path as string, old_string: input.old_string as string, new_string: input.new_string as string, replace_all: input.replace_all as boolean | undefined }) };

  async execute(input: { file_path: string; old_string: string; new_string: string; replace_all?: boolean }, context: ToolUseContext) {
    const fullPath = resolveAndValidatePath(context.cwd, input.file_path);
    let fileContent: string;
    try {
      fileContent = await fs.readFile(fullPath, 'utf-8');
    } catch (e: any) {
      if (e.code === 'ENOENT') return { success: false, error: `文件不存在: ${input.file_path}` };
      return { success: false, error: `读取文件失败: ${e.message}` };
    }
    const actualOldString = this.findActualString(fileContent, input.old_string);
    if (!actualOldString) return { success: false, error: `未找到要替换的字符串: ${input.old_string.substring(0, 50)}...` };
    const matches = fileContent.split(actualOldString).length - 1;
    if (matches > 1 && !input.replace_all) return { success: false, error: `找到 ${matches} 处匹配，请提供更具体的字符串或设置 replace_all=true` };
    const updatedFile = input.replace_all ? fileContent.split(actualOldString).join(input.new_string) : fileContent.replace(actualOldString, input.new_string);
    await fs.writeFile(fullPath, updatedFile, 'utf-8');
    try {
      const newStats = await fs.stat(fullPath);
      context.readFileState.set(fullPath, { content: updatedFile, timestamp: newStats.mtimeMs });
    } catch {}
    return { success: true, filePath: path.basename(fullPath), replacedCount: input.replace_all ? matches : 1 };
  }

  private findActualString(fileContent: string, searchString: string): string | null {
    if (!fileContent || !searchString) return null;
    if (fileContent.includes(searchString)) return searchString;
    const normalizedQuotesSearch = this.normalizeQuotes(searchString);
    const normalizedQuotesFile = this.normalizeQuotes(fileContent);
    const idx = normalizedQuotesFile.indexOf(normalizedQuotesSearch);
    if (idx !== -1) return fileContent.substring(idx, idx + searchString.length);
    const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexSource = escaped.replace(/\s+/g, '\\s*');
    try {
      const regex = new RegExp(regexSource, 'm');
      const match = fileContent.match(regex);
      if (match) return match[0];
    } catch {}
    return null;
  }

  private normalizeQuotes(str: string): string {
    return str ? str.replace(/[‘’]/g, "'").replace(/[“”]/g, '"') : '';
  }
}

/**
 * 写入文件工具
 */
export class WriteTool extends BaseTool {
  name = 'Write';
  description = '写入或创建文件';
  parameters = { type: 'object', properties: { file_path: { type: 'string', description: '要写入的文件路径' }, content: { type: 'string', description: '文件内容' } }, required: ['file_path', 'content'] };
  inputSchema = { parse: (input: any) => ({ file_path: input.file_path as string, content: input.content as string }) };

  async execute(input: { file_path: string; content: string }, context: ToolUseContext) {
    const fullPath = resolveAndValidatePath(context.cwd, input.file_path);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, input.content, 'utf-8');
    try {
      const stats = await fs.stat(fullPath);
      context.readFileState.set(fullPath, { content: input.content, timestamp: stats.mtimeMs });
    } catch {}
    return { success: true, filePath: input.file_path, bytesWritten: Buffer.byteLength(input.content, 'utf-8') };
  }
}

/**
 * 执行 Bash 命令工具
 */
export class BashTool extends BaseTool {
  name = 'Bash';
  description = '执行 Bash 命令';
  parameters = { type: 'object', properties: { command: { type: 'string', description: '要执行的 Bash 命令' }, timeout: { type: 'number', description: '超时时间（毫秒，可选）' } }, required: ['command'] };
  inputSchema = { parse: (input: any) => ({ command: input.command as string, timeout: input.timeout as number | undefined }) };
  isConcurrencySafe() { return false; }

  async execute(input: { command: string; timeout?: number }, context: ToolUseContext): Promise<any> {
    return new Promise((resolve) => {
      const { command, timeout = 30000 } = input;
      if (context.abortController.signal.aborted) { resolve({ success: false, error: '命令被用户中断' }); return; }
      if (command.includes('..')) { resolve({ success: false, error: '操作禁止: Bash 指令中禁止包含路径跳转符号 ".."' }); return; }
      const fullCommand = context.setupCommands.length > 0 ? `${context.setupCommands.join(' && ')} && ${command}` : command;
      const child = require('child_process').spawn('/bin/bash', ['-c', fullCommand], { cwd: context.cwd, signal: context.abortController.signal });
      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => { child.kill('SIGKILL'); resolve({ success: false, error: `命令超时 (${timeout}ms)` }); }, timeout);
      child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); context.emit?.('progress', { type: 'stdout', content: data.toString() }); });
      child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); context.emit?.('progress', { type: 'stderr', content: data.toString() }); });
      child.on('close', (code: number) => { clearTimeout(timer); resolve({ success: code === 0, exitCode: code, stdout, stderr }); });
      child.on('error', (err: Error) => { clearTimeout(timer); resolve({ success: false, error: err.message }); });
      context.abortController.signal.addEventListener('abort', () => child.kill('SIGKILL'));
    });
  }
}

/**
 * 搜索文件工具
 */
export class GrepTool extends BaseTool {
  name = 'Grep';
  description = '在文件中搜索文本模式';
  parameters = { type: 'object', properties: { pattern: { type: 'string', description: '要搜索的正则表达式模式' }, file_path: { type: 'string', description: '要搜索的文件路径（可选）' }, case_insensitive: { type: 'boolean', description: '是否大小写不敏感（可选）' } }, required: ['pattern'] };
  inputSchema = { parse: (input: any) => ({ pattern: input.pattern as string, file_path: input.file_path as string | undefined, case_insensitive: input.case_insensitive as boolean | undefined }) };
  isConcurrencySafe() { return true; }

  async execute(input: { pattern: string; file_path?: string; case_insensitive?: boolean }, context: ToolUseContext) {
    try {
      if (input.file_path) {
        const fullPath = resolveAndValidatePath(context.cwd, input.file_path);
        const content = await fs.readFile(fullPath, 'utf-8');
        const lines = content.split('\n');
        const results = this.searchInLines(lines, input.pattern, input.case_insensitive);
        return { success: true, results, filePath: input.file_path, matchCount: results.length };
      }
      return { success: true, results: [], totalMatches: 0 };
    } catch (e: any) { return { success: false, error: e.message }; }
  }

  private searchInLines(lines: string[], pattern: string, caseInsensitive?: boolean): { line: number; content: string }[] {
    const results: { line: number; content: string }[] = [];
    try { const regex = new RegExp(pattern, caseInsensitive ? 'i' : ''); for (let i = 0; i < lines.length; i++) { if (regex.test(lines[i])) results.push({ line: i + 1, content: lines[i] }); } } catch {}
    return results;
  }
}

/**
 * 列出目录工具
 */
export class GlobTool extends BaseTool {
  name = 'Glob';
  description = '列出目录中的文件';
  parameters = { type: 'object', properties: { pattern: { type: 'string', description: '文件名匹配模式（如 *.ts）' }, cwd: { type: 'string', description: '要在哪个目录搜索（可选）' } }, required: ['pattern'] };
  inputSchema = { parse: (input: any) => ({ pattern: input.pattern as string, cwd: input.cwd as string | undefined }) };
  isConcurrencySafe() { return true; }

  async execute(input: { pattern: string; cwd?: string }, context: ToolUseContext) {
    const targetDir = input.cwd ? resolveAndValidatePath(context.cwd, input.cwd) : context.cwd;
    try {
      const files = await this.glob(input.pattern, targetDir);
      return { success: true, files, count: files.length };
    } catch (e: any) { return { success: false, error: e.message }; }
  }

  private async glob(pattern: string, dir: string): Promise<string[]> {
    const results: string[] = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) { if (!entry.name.startsWith('.') && entry.name !== 'node_modules') { const sub = await this.glob(pattern, fullPath); results.push(...sub); } }
        else if (this.matchPattern(pattern, entry.name)) results.push(fullPath);
      }
    } catch {}
    return results;
  }

  private matchPattern(pattern: string, filename: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    return regex.test(filename);
  }
}

/**
 * 环境持久化工具
 */
export class EnvTool extends BaseTool {
  name = 'Env';
  description = '持久化环境变量或脚本，这些脚本将在后续的所有 Bash 任务执行前自动运行';
  parameters = { type: 'object', properties: { command: { type: 'string', description: '要持久化的环境指令' } }, required: ['command'] };
  inputSchema = { parse: (input: any) => ({ command: input.command as string }) };

  async execute(input: { command: string }, context: ToolUseContext) {
    context.addSetupCommand(input.command);
    return { success: true, message: `环境指令已持久化：${input.command}`, currentSetupCommands: context.setupCommands };
  }
}

// ========== 6. 工具注册表 ==========

export class ToolRegistry {
  private tools: Map<string, any> = new Map();

  constructor() {
    this.register(new ReadTool());
    this.register(new EditTool());
    this.register(new WriteTool());
    this.register(new BashTool());
    this.register(new GrepTool());
    this.register(new GlobTool());
    this.register(new EnvTool());
  }

  register(tool: any) { this.tools.set(tool.name, tool); }
  get(name: string) { return this.tools.get(name); }
  getAll(): any[] { return Array.from(this.tools.values()); }
  getNames(): string[] { return Array.from(this.tools.keys()); }
}

// ========== 7. 会话接口 ==========

export interface AgentSession {
  id: string;
  title: string;
  messages: Message[];
  abortController: AbortController;
  createdAt: number;
  skill?: string;
}

// ========== 8. Agent 服务 ==========

@Injectable()
export class AgentService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AgentService.name);
  private sessions: Map<string, AgentSession> = new Map();
  private toolRegistry: ToolRegistry;
  private mcpTools: ToolDefinition[] = [];
  private mcpManager: McpManager;
  private skillManager: SkillManager;
  private eventEmitter = new EventEmitter();

  private readonly configPath: string;

  private llmConfig = {
    apiKey: (process.env.AI_AGENT_API_KEY || '').trim(),
    baseUrl: (process.env.AI_AGENT_BASE_URL || 'https://api.openai.com/v1').trim(),
    model: (process.env.AI_AGENT_MODEL || 'gpt-4o').trim(),
  };
  private fileManageConfig = {
    url: (process.env.FILE_MANAGE_URL || '').trim(),
    apiKey: (process.env.FILE_MANAGE_KEY || 'sun-agent-secret-key').trim(),
  };
  private readonly historyDir: string;
  private readonly attachmentsDir: string;
  private readonly skillsDir: string;
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();
  private forceMockMode = false;

  constructor() {
    const baseAgentDir = path.join(process.cwd(), '.agent');
    this.configPath = path.join(baseAgentDir, 'config.json');
    this.historyDir = path.join(baseAgentDir, 'history');
    this.attachmentsDir = path.join(process.cwd(), 'temp_attachments');
    this.skillsDir = path.join(__dirname, 'skills');
    this.toolRegistry = new ToolRegistry();
    this.mcpManager = new McpManager(baseAgentDir);
    this.skillManager = new SkillManager(this.skillsDir);

    fs.mkdir(baseAgentDir, { recursive: true }).catch(() => {});
    fs.mkdir(this.historyDir, { recursive: true }).catch(() => {});
    fs.mkdir(this.attachmentsDir, { recursive: true }).catch(() => {});

    this.loadConfigSync();
    this.logger.log(`AgentService 初始化完成, 内置工具: ${this.toolRegistry.getNames().join(', ')}`);
    this.setupCleanupTask();
  }

  private loadConfigSync() {
    try {
      const raw = readFileSync(this.configPath, 'utf-8');
      const cfg = JSON.parse(raw);
      if (cfg.apiKey) this.llmConfig.apiKey = cfg.apiKey;
      if (cfg.baseUrl) this.llmConfig.baseUrl = cfg.baseUrl;
      if (cfg.model) this.llmConfig.model = cfg.model;
      if (cfg.fileManageUrl) this.fileManageConfig.url = cfg.fileManageUrl;
      if (cfg.fileManageKey) this.fileManageConfig.apiKey = cfg.fileManageKey;
      this.logger.log(`已从 ${this.configPath} 加载配置`);
    } catch {
      this.logger.log('无持久化配置，使用默认值');
    }
  }

  async onModuleInit() {
    try {
      await this.mcpManager.init();
      await this.refreshMcpTools();
    } catch (e: any) {
      this.logger.error(`初始化 MCP 失败: ${e.message}`);
    }
  }

  async onModuleDestroy() {
    try { await this.mcpManager.shutdown(); } catch (e: any) { this.logger.error(`关闭 MCP 失败: ${e.message}`); }
  }

  async refreshMcpTools() {
    try {
      this.mcpTools = await this.mcpManager.getAllTools();
      this.logger.log(`同步了 ${this.mcpTools.length} 个 MCP 工具`);
    } catch (e: any) { this.logger.error(`获取 MCP 工具失败: ${e.message}`); }
  }

  getToolRegistry(): ToolRegistry { return this.toolRegistry; }

  // ========== MCP 管理 ==========

  async getMcpConfigs() {
    const mcpConfigFile = path.join(process.cwd(), '.agent', '.mcp.json');
    try { const content = await fs.readFile(mcpConfigFile, 'utf-8'); const json = JSON.parse(content); return json.mcpServers || {}; } catch { return {}; }
  }

  async saveMcpConfigs(configs: any) {
    const mcpConfigFile = path.join(process.cwd(), '.agent', '.mcp.json');
    await fs.mkdir(path.dirname(mcpConfigFile), { recursive: true }).catch(() => {});
    await fs.writeFile(mcpConfigFile, JSON.stringify({ mcpServers: configs }, null, 2), 'utf-8');
  }

  async addMcpConfig(name: string, config: any) {
    const configs = await this.getMcpConfigs();
    configs[name] = config;
    await this.saveMcpConfigs(configs);
    await this.mcpManager.connectServer(name, config);
    await this.refreshMcpTools();
    return { success: true, configs };
  }

  async deleteMcpConfig(name: string) {
    const configs = await this.getMcpConfigs();
    delete configs[name];
    await this.saveMcpConfigs(configs);
    await this.mcpManager.disconnectServer(name);
    await this.refreshMcpTools();
    return { success: true, configs };
  }

  // ========== LLM 配置管理（持久化到 .agent/config.json） ==========

  async getLlmConfig() {
    return { ...this.llmConfig, fileManageUrl: this.fileManageConfig.url, fileManageKey: this.fileManageConfig.apiKey };
  }

  async updateLlmConfig(config: { apiKey?: string; baseUrl?: string; model?: string; fileManageUrl?: string; fileManageKey?: string }) {
    if (config.apiKey !== undefined) this.llmConfig.apiKey = config.apiKey.trim();
    if (config.baseUrl !== undefined) this.llmConfig.baseUrl = config.baseUrl.trim();
    if (config.model !== undefined) this.llmConfig.model = config.model.trim();
    if (config.fileManageUrl !== undefined) this.fileManageConfig.url = config.fileManageUrl.trim();
    if (config.fileManageKey !== undefined) this.fileManageConfig.apiKey = config.fileManageKey.trim();
    await this.saveConfig();
    this.logger.log('Agent 配置已更新并持久化');
    return { success: true, config: { ...this.llmConfig, fileManageUrl: this.fileManageConfig.url, fileManageKey: this.fileManageConfig.apiKey } };
  }

  private async saveConfig() {
    const data = {
      apiKey: this.llmConfig.apiKey,
      baseUrl: this.llmConfig.baseUrl,
      model: this.llmConfig.model,
      fileManageUrl: this.fileManageConfig.url,
      fileManageKey: this.fileManageConfig.apiKey,
    };
    try { await fs.writeFile(this.configPath, JSON.stringify(data, null, 2), 'utf-8'); } catch (e: any) {
      this.logger.error(`保存配置失败: ${e.message}`);
    }
  }

  // ========== Skills 管理 ==========

  async listSkills() {
    const skills: any[] = [];
    try {
      const files = await fs.readdir(this.skillsDir);
      for (const file of files) {
        if (file.endsWith('.skill.ts') || file.endsWith('.skill.js')) continue;
        if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.md')) {
          try {
            const content = await fs.readFile(path.join(this.skillsDir, file), 'utf-8');
            skills.push({ name: file, content: content.substring(0, 200) });
          } catch {}
        }
      }
    } catch {}
    return skills;
  }

  // ========== 定时清理 ==========

  private setupCleanupTask() {
    setInterval(async () => {
      try {
        const stats = await fs.stat(this.attachmentsDir).catch(() => null);
        if (!stats) return;
        const files = await fs.readdir(this.attachmentsDir);
        const now = Date.now();
        for (const file of files) {
          const filePath = path.join(this.attachmentsDir, file);
          const fStats = await fs.stat(filePath);
          if (now - fStats.mtimeMs > 4 * 60 * 60 * 1000) await fs.unlink(filePath);
        }
      } catch {}
    }, 60 * 60 * 1000);
  }

  // ========== 会话管理 ==========

  createSession() {
    const id = this.generateId();
    const session: AgentSession = {
      id, title: '新会话', messages: [], abortController: new AbortController(), createdAt: Date.now(),
    };
    this.sessions.set(id, session);
    this.logger.log(`创建会话: ${id}`);
    return session;
  }

  getSession(id: string) { return this.sessions.get(id); }
  getSessions() { return this.sessions; }

  abortSession(id: string) {
    const session = this.sessions.get(id);
    if (session) { session.abortController.abort(); session.abortController = new AbortController(); }
  }

  async closeSession(id: string) {
    this.abortSession(id);
    const session = this.sessions.get(id);
    if (session) await this.saveSessionImmediate(session);
    this.sessions.delete(id);
  }

  // ========== 会话持久化 ==========

  private scheduleSaveSession(session: AgentSession) {
    if (this.saveTimers.has(session.id)) clearTimeout(this.saveTimers.get(session.id)!);
    const timer = setTimeout(async () => {
      try {
        const { abortController, ...saveData } = session as any;
        await fs.writeFile(path.join(this.historyDir, `${session.id}.json`), JSON.stringify({ ...saveData, updatedAt: Date.now() }, null, 2));
      } catch (err: any) { this.logger.error(`保存会话失败: ${err.message}`); }
    }, 2000);
    this.saveTimers.set(session.id, timer);
  }

  private async saveSessionImmediate(session: AgentSession) {
    if (this.saveTimers.has(session.id)) { clearTimeout(this.saveTimers.get(session.id)!); this.saveTimers.delete(session.id); }
    try {
      const { abortController, ...saveData } = session as any;
      await fs.writeFile(path.join(this.historyDir, `${session.id}.json`), JSON.stringify({ ...saveData, updatedAt: Date.now() }, null, 2));
    } catch (err: any) { this.logger.error(`立即保存会话失败: ${err.message}`); }
  }

  // ========== 历史记录 ==========

  async listHistory() {
    try {
      const files = await fs.readdir(this.historyDir);
      const history: any[] = [];
      for (const f of files) {
        if (f.endsWith('.json')) { const c = await fs.readFile(path.join(this.historyDir, f), 'utf-8'); history.push(JSON.parse(c)); }
      }
      return history.sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } catch { return []; }
  }

  async loadHistory(id: string) {
    try {
      const filePath = path.join(this.historyDir, `${id}.json`);
      const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      const session: AgentSession = { ...data, abortController: new AbortController() };
      this.sessions.set(id, session);
      return session;
    } catch { return null; }
  }

  async deleteHistory(id: string) {
    try { await fs.unlink(path.join(this.historyDir, `${id}.json`)); this.sessions.delete(id); return { success: true }; } catch { return { success: false }; }
  }

  async clearAllHistory() {
    try {
      this.sessions.clear();
      const files = await fs.readdir(this.historyDir);
      for (const f of files) { if (f.endsWith('.json')) await fs.unlink(path.join(this.historyDir, f)); }
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  }

  // ========== 消息处理（SSE 流式） ==========

  async *processMessage(
    sessionId: string,
    userMessage: string,
    sourceCode?: string,
    skill?: string,
    formFields?: any[],
    flowNodes?: any[],
    fieldPermissions?: any,
    attachments?: { name: string; path: string }[],
    availableActions?: string[],
  ): AsyncGenerator<StreamEvent, void, unknown> {
    let finalUserMessage = userMessage;
    const textAttachments: string[] = [];
    const imageAttachments: any[] = [];

    // 处理附件
    if (attachments && attachments.length > 0) {
      for (const a of attachments) {
        try {
          const filePath = path.join(this.attachmentsDir, a.path);
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(a.name);
          if (isImage) {
            let publicUrl = '';
            if (this.fileManageConfig.url) {
              try { publicUrl = await this.uploadFileToService(filePath, a.name); } catch {}
            }
            if (publicUrl) {
              const hasNonStandardPort = /:[0-9]+/.test(publicUrl) && !publicUrl.includes(':80') && !publicUrl.includes(':443');
              let base64 = '';
              if (hasNonStandardPort) {
                const buffer = await fs.readFile(filePath);
                const compressed = await sharp(buffer).resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 60 }).toBuffer();
                base64 = `data:image/jpeg;base64,${compressed.toString('base64')}`;
              }
              imageAttachments.push({ name: a.name, path: a.path, content: base64, url: publicUrl, isImage: true });
            } else {
              const buffer = await fs.readFile(filePath);
              const compressed = await sharp(buffer).resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 60 }).toBuffer();
              const base64 = `data:image/jpeg;base64,${compressed.toString('base64')}`;
              imageAttachments.push({ name: a.name, path: a.path, content: base64, isImage: true });
            }
          } else {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            textAttachments.push(`【文件附件: ${a.name}】\n内容:\n---\n${fileContent}\n---`);
          }
        } catch (e: any) { this.logger.error(`处理附件失败: ${a.path}, 错误: ${e.message}`); }
      }
      if (textAttachments.length > 0 || imageAttachments.length > 0) {
        if (textAttachments.length > 0) finalUserMessage = `${textAttachments.join('\n\n')}\n\n${userMessage}`;
        if (imageAttachments.length > 0) finalUserMessage = `用户上传了 ${imageAttachments.length} 张图片。\n\n${finalUserMessage}`;
      }
    }

    // 获取或创建会话
    let session = this.sessions.get(sessionId);
    if (!session) { session = this.createSession(); sessionId = session.id; }
    if (skill) session.skill = skill;

    // 构建上下文信息
    let messageContent = finalUserMessage;
    const contextParts: string[] = [];

    if (skill === 'aiFiller') {
      contextParts.push(`【当前页面可用的快捷按钮动作】\n${availableActions?.length ? JSON.stringify(availableActions, null, 2) : '当前无可用快捷动作'}`);
      contextParts.push(`【当前活动表单的 JSON Schema 协议】\n${formFields?.length ? JSON.stringify(formFields, null, 2) : '当前未激活任何表单'}`);
    } else {
      if (formFields?.length) contextParts.push(`【已定义字段】\n${JSON.stringify(formFields, null, 2)}`);
      if (availableActions?.length) contextParts.push(`【当前页面可用的快捷按钮动作】\n${JSON.stringify(availableActions, null, 2)}`);
    }
    if (flowNodes?.length && fieldPermissions && Object.keys(fieldPermissions).length) {
      contextParts.push(`【字段权限（按节点）】\n${JSON.stringify({ nodes: flowNodes, fieldPermissions }, null, 2)}`);
    } else if (flowNodes?.length) {
      contextParts.push(`【流程节点】\n${JSON.stringify(flowNodes, null, 2)}`);
    }
    if (sourceCode) contextParts.push(`【当前页面源码】\n\`\`\`html\n${sourceCode}\n\`\`\``);
    if (contextParts.length > 0) messageContent = contextParts.join('\n\n') + '\n\n' + finalUserMessage;

    const userMsg: Message = {
      id: this.generateId(), role: 'user', content: messageContent,
      timestamp: Date.now(), attachments: imageAttachments.length > 0 ? imageAttachments : undefined,
    };
    session.messages.push(userMsg);

    if (!session.title || session.title === '新会话') this.generateSessionTitle(session, userMessage);

    this.scheduleSaveSession(session);

    // Mock 模式或真实 LLM
    if (!this.llmConfig.apiKey || this.forceMockMode) {
      yield* this.processWithMockLLM(session, messageContent);
      return;
    }

    yield* this.processWithLLM(session);
  }

  // ========== Mock LLM 模式 ==========

  private async *processWithMockLLM(session: AgentSession, userMessage: string): AsyncGenerator<StreamEvent, void, unknown> {
    this.logger.log(`[Mock] 处理消息: ${userMessage.substring(0, 100)}...`);
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('read') || lowerMsg.includes('读取') || lowerMsg.includes('文件')) {
      yield { type: 'text', content: '我来帮你读取文件...' };
      const readTool = this.toolRegistry.get('Read');
      if (readTool) {
        const pathMatch = userMessage.match(/[\/\w]+\.[\w]+/);
        if (pathMatch) {
          const context = this.makeMockContext();
          const result = await readTool.execute({ file_path: pathMatch[0], limit: 50 }, context);
          yield { type: 'tool_result', toolCall: { id: '1', name: 'Read', input: { file_path: pathMatch[0] }, result } };
          yield { type: 'text', content: `\n已读取文件 ${pathMatch[0]}\n\n请告诉我你想要什么样的修改？` };
        } else { yield { type: 'text', content: '请告诉我你想读取哪个文件？' }; }
      }
    } else if (lowerMsg.includes('ls') || lowerMsg.includes('目录') || lowerMsg.includes('list')) {
      yield { type: 'text', content: '列出当前目录文件...' };
      const globTool = this.toolRegistry.get('Glob');
      if (globTool) {
        const context = this.makeMockContext();
        const result = await globTool.execute({ pattern: '*' }, context);
        yield { type: 'tool_result', toolCall: { id: '2', name: 'Glob', input: { pattern: '*' }, result } };
      }
    } else {
      yield { type: 'text', content: `我收到: "${userMessage.substring(0, 100)}"\n\n我可以帮助您：\n- 读取/编辑/写入文件\n- 搜索代码\n- 执行 Bash 命令\n- 列出目录\n\n请设置 AI_AGENT_API_KEY 以启用完整 AI 功能。` };
    }
    yield { type: 'done' };
  }

  private makeMockContext(): any {
    const ac = new AbortController();
    return {
      cwd: process.cwd(),
      sessionId: 'mock',
      readFileState: new FileStateCache(),
      abortController: ac,
      setupCommands: [],
      addSetupCommand: () => {},
      setInProgressToolUseIDs: () => {},
      emit: () => {},
    };
  }

  // ========== 真实 LLM 处理 ==========

  private async *processWithLLM(session: AgentSession, maxIterations = 30): AsyncGenerator<StreamEvent, void, unknown> {
    // 获取动态激活的 Skills
    const lastUserMsg = [...session.messages].reverse().find(m => m.role === 'user');
    const activeSkills = lastUserMsg ? await this.skillManager.getActiveSkills(lastUserMsg.content) : [];
    const skillsContent = activeSkills.join('\n\n');

    // 清除悬挂工具调用
    const cleanDanglingMessages = (msgs: any[]) => {
      if (msgs.length === 0) return msgs;
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg.role === 'assistant' && (lastMsg.toolCalls?.length || lastMsg.tool_calls?.length)) { msgs.pop(); }
      return msgs;
    };
    session.messages = cleanDanglingMessages(session.messages);

    // Token 估算与对话压缩
    if (this.estimateTokenCount(session.messages) > 120000 || session.messages.length > 20) {
      yield { type: 'text', content: '💬 *系统提醒：对话历史较长，正在为您自动压缩总结上下文...*' };
      await this.summarizeConversation(session, skillsContent);
      if (this.estimateTokenCount(session.messages) > 120000) { yield { type: 'error', error: `CONTEXT_TOO_LONG:${this.estimateTokenCount(session.messages)}` }; return; }
    }

    let iteration = 0;
    while (iteration < maxIterations) {
      if (session.abortController.signal.aborted) break;
      iteration++;

      // 重新获取 Skills
      const userMsg = [...session.messages].reverse().find(m => m.role === 'user');
      const skills = userMsg ? await this.skillManager.getActiveSkills(userMsg.content) : [];
      const systemPrompt = this.buildSystemPrompt(session.skill, skills.join('\n\n'));

      // 构建工具列表（内置工具 + MCP 工具）
      const builtInTools = this.toolRegistry.getAll();
      const allTools = [
        ...builtInTools.map(t => ({ type: 'function' as const, function: { name: t.name, description: t.description, parameters: t.parameters } })),
        ...this.mcpTools.map(t => ({ type: 'function' as const, function: { name: t.name.replace(/:/g, '__'), description: t.description, parameters: t.parameters } })),
      ];

      const msgs = [{ role: 'system', content: systemPrompt }, ...this.buildMessages(session)];

      try {
        const response = this.callLLMStream(msgs, allTools.length > 0 ? allTools : undefined, session.abortController.signal);
        let fullContent = '';
        const assistantToolCalls: ToolCall[] = [];

        for await (const chunk of response) {
          if (session.abortController.signal.aborted) break;
          if (chunk.type === 'text') fullContent += chunk.content || '';
          else if (chunk.type === 'tool_call' && chunk.toolCall) assistantToolCalls.push(chunk.toolCall);
          yield chunk;
        }

        // 保存助手消息
        if (fullContent || assistantToolCalls.length > 0) {
          session.messages.push({
            id: this.generateId(), role: 'assistant', content: fullContent, timestamp: Date.now(),
            toolCalls: assistantToolCalls.length > 0 ? assistantToolCalls.map(tc => ({
              id: tc.id, type: 'function',
              function: { name: tc.name, arguments: JSON.stringify(tc.input) }
            })) : undefined,
          } as any);
          this.scheduleSaveSession(session);
        }

        if (!fullContent && assistantToolCalls.length === 0) break;

        // 执行工具调用
        if (assistantToolCalls.length > 0) {
          for (const tc of assistantToolCalls) {
            if (session.abortController.signal.aborted) break;
            const result = await this.executeToolCall(session, tc);
            session.messages.push({
              id: this.generateId(), role: 'tool', content: typeof result === 'string' ? result : JSON.stringify(result),
              timestamp: Date.now(), toolCallId: tc.id, toolName: tc.name,
            } as any);
            this.scheduleSaveSession(session);
            yield { type: 'tool_result', toolCall: { ...tc, result } };
          }
          continue;
        }
        break;
      } catch (error: any) {
        if (error.name === 'AbortError' || session.abortController.signal.aborted) break;
        this.logger.error(`LLM 调用失败: ${error.message}`);
        yield { type: 'error', error: error.message };
        break;
      }
    }
    yield { type: 'done' };
  }

  private buildMessages(session: AgentSession): any[] {
    const msgs: any[] = [];
    for (const m of session.messages) {
      if (m.role === 'assistant') {
        const msg: any = { role: 'assistant', content: m.content || '' };
        if (m.toolCalls?.length) msg.tool_calls = m.toolCalls;
        msgs.push(msg);
      } else if (m.role === 'tool') {
        msgs.push({ role: 'tool', content: m.content || '', tool_call_id: m.toolCallId || 'missing_id', name: m.toolName?.replace(/:/g, '__') });
      } else {
        const contentParts: any[] = [];
        if (m.content) contentParts.push({ type: 'text', text: m.content });
        if (m.attachments?.length) {
          for (const att of m.attachments) {
            if (att.isImage) {
              if (att.url && !( /:[0-9]+/.test(att.url) && !att.url.includes(':80') && !att.url.includes(':443'))) {
                contentParts.push({ type: 'image_url', image_url: { url: att.url } });
              } else if (att.content) {
                const imageUrl = att.content.startsWith('data:') ? att.content : `data:image/png;base64,${att.content}`;
                contentParts.push({ type: 'image_url', image_url: { url: imageUrl, detail: 'high' } });
              }
            }
          }
        }
        msgs.push(contentParts.length > 1 ? { role: m.role, content: contentParts } : { role: m.role, content: m.content || '' });
      }
    }
    return msgs;
  }

  // ========== 构建系统提示 ==========

  private buildSystemPrompt(skill?: string, skillsContent?: string): string {
    const cwd = process.cwd();
    const basePrompt = `你是 Claude，一个极其高效且自主的 AI 编程助手。
${skillsContent ? `\n**【当前激活的特定领域技能 (Skills)】**：\n${skillsContent}\n` : ''}
你的目标是：以最少的对话次数，最直接地完成用户的代码修改、分析和执行任务。

**【空间位置核心规范】**：
1. 你当前所在的物理绝对路径 (CWD) 是：\`${cwd}\`。
2. 你负责的项目就在这个目录下。
3. **路径使用规范**：在执行 Bash 命令或读取文件时，请直接使用该绝对路径或相对路径。
4. **禁止越权**：严禁尝试访问父目录（即 \`../\`）。
5. **元数据盲区**：展示的 HTML 预览内容可能包含 \`data-v-line\` 或 \`data-v-file\` 等内部追踪标记。你必须将这些标记视为**完全不可见**的。**绝对严禁**在你的任何言语回复中提及这些标记。
6. **纯净源码原则**：你输出的代码块或对文件的修改，严禁带入任何形式的开发环境临时标记。
7. **禁止运行服务**：**严禁**自主启动项目预览或长期运行的服务程序（如 \`npm run dev\`, \`vite\` 等）。
8. **多模态视觉处理规范**：当用户上传图片时，图片像素数据已直接嵌入。你**必须直接观察并描述图片内容**，不需要调用任何外部工具来看图片。

**【内置工具】**：
你有以下内置工具可以直接使用：
- **Read**：读取文件内容（支持 offset/limit）
- **Edit**：使用字符串匹配编辑文件
- **Write**：写入或创建新文件
- **Bash**：执行 Bash 命令
- **Grep**：在文件中搜索文本模式
- **Glob**：列出目录中的文件
- **Env**：持久化环境变量

核心原则：
1. **自主行动**：不要询问"我是否应该这样做？"。直接调用工具执行。
2. **工具第一**：不要在调用工具前写长篇累牍的计划。
3. **极简对话**：除工具调用外，只提供必要的架构解释。
4. **路径优先**：在处理大型代码文件时，优先提供路径给工具处理。
5. **自我修复**：如果工具调用失败，分析报错信息，尝试调整参数或改用其他工具。

如果你已经完成了用户的要求，请在回复的最后添加标记：【执行完毕】。`;

    // 如果有 skill，尝试加载 skill 提示词并追加
    if (skill) {
      const skillPrompt = this.loadSkillPromptSync(skill);
      if (skillPrompt) return `${basePrompt}\n\n${skillPrompt}`;
    }
    return basePrompt;
  }

  private loadSkillPromptSync(skill: string): string | null {
    try {
      const fullPath = path.join(this.skillsDir, `${skill}.skill.js`);
      delete require.cache[require.resolve(fullPath)];
      const mod = require(fullPath);
      const skillObj = mod.skill || mod.default;
      if (skillObj?.content) return skillObj.content;
    } catch {}
    try {
      const fullPath = path.join(this.skillsDir, `${skill}.skill.ts`);
      delete require.cache[require.resolve(fullPath)];
      const mod = require(fullPath);
      const skillObj = mod.skill || mod.default;
      if (skillObj?.content) return skillObj.content;
    } catch {}
    return null;
  }

  // ========== 执行工具调用 ==========

  private async executeToolCall(session: AgentSession, toolCall: ToolCall): Promise<any> {
    const originalName = toolCall.name.replace(/__/g, ':');
    // 优先找内置工具
    let tool = this.toolRegistry.get(originalName);
    let actualToolName = originalName;
    if (!tool && originalName.includes(':')) {
      actualToolName = originalName.split(':').pop()!;
      tool = this.toolRegistry.get(actualToolName);
    }

    const context: ToolUseContext = {
      cwd: process.cwd(),
      sessionId: session.id,
      readFileState: {},
      abortController: session.abortController,
      setupCommands: [],
      addSetupCommand: () => {},
      setInProgressToolUseIDs: () => {},
      emit: (event: string, data: any) => this.eventEmitter.emit(`${session.id}:${event}`, data),
    };

    if (tool) {
      try {
        const input = tool.inputSchema.parse(toolCall.input);
        return await tool.execute(input, context);
      } catch (error: any) { return { success: false, error: error.message }; }
    }

    // 否则找 MCP 工具
    const mcpTool = this.mcpTools.find(t => t.name === originalName);
    if (mcpTool) {
      this.logger.log(`执行 MCP 工具: ${originalName}`);
      try { return await mcpTool.execute(toolCall.input, context); } catch (e: any) { return { error: e.message }; }
    }

    return { success: false, error: `未知工具: ${toolCall.name}` };
  }

  // ========== LLM 流式调用 ==========

  private async *callLLMStream(messages: any[], tools?: any[], abortSignal?: AbortSignal): AsyncGenerator<StreamEvent, void, unknown> {
    const baseUrl = this.llmConfig.baseUrl.replace(/\/chat\/completions\/?$/, '');
    const url = `${baseUrl}/chat/completions`;
    this.logger.debug(`LLM URL: ${url}, Models: ${this.llmConfig.model}`);

    let response: Response | null = null;
    let lastError = '';
    let retries = 3;

    while (retries > 0) {
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.llmConfig.apiKey}`,
            'Accept': 'application/json, text/event-stream',
          },
          body: JSON.stringify({ model: this.llmConfig.model, messages, tools: tools?.length ? tools : undefined, stream: true }),
          signal: abortSignal,
        });
        if (response.ok) break;
        const errorText = await response.text();
        lastError = `LLM API 错误: ${response.status} - ${errorText}`;
        if (response.status === 503 || response.status === 429) { retries--; if (retries > 0) { await new Promise(r => setTimeout(r, 2000)); continue; } }
        throw new Error(lastError);
      } catch (e: any) {
        if (e.name === 'AbortError') throw e;
        if (retries <= 1) throw e;
        retries--; await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!response || !response.ok) throw new Error(lastError || 'LLM 请求失败');
    const stream = response.body;
    if (!stream) throw new Error('响应体为空');

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const accumulatedToolCalls: Map<number, any> = new Map();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          const dataMatch = trimmed.match(/^data:\s*(.*)$/);
          if (!dataMatch) continue;
          try {
            const data = JSON.parse(dataMatch[1]);
            if (data === '[DONE]') continue;
            const delta = data.choices?.[0]?.delta;
            if (!delta) continue;
            if (delta.content) yield { type: 'text', content: delta.content };
            const reasoning = delta.reasoning_content || delta.thought;
            if (reasoning) yield { type: 'text', content: reasoning, isReasoning: true };
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const index = tc.index ?? 0;
                const existing = accumulatedToolCalls.get(index);
                if (existing) {
                  for (const key in tc) {
                    if (key === 'function' && typeof tc[key] === 'object') {
                      existing.function = existing.function || {};
                      for (const fKey in tc.function) { if (typeof tc.function[fKey] === 'string') existing.function[fKey] = (existing.function[fKey] || '') + tc.function[fKey]; else existing.function[fKey] = tc.function[fKey]; }
                    } else if (typeof tc[key] === 'string') { existing[key] = (existing[key] || '') + tc[key]; } else { existing[key] = tc[key]; }
                  }
                } else { accumulatedToolCalls.set(index, JSON.parse(JSON.stringify(tc))); }
              }
            }
          } catch {}
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      throw error;
    } finally { reader.releaseLock(); }

    for (const [index, tc] of accumulatedToolCalls) {
      const name = tc.function?.name || tc.name;
      const argsStr = tc.function?.arguments || tc.arguments || '';
      if (!tc.id || !name) continue;
      let input = {};
      try { input = argsStr ? JSON.parse(argsStr) : {}; } catch {}
      yield { type: 'tool_call', toolCall: { id: tc.id, name: name.replace(/__/g, ':'), input, _raw: tc } };
    }
  }

  // ========== Token 估算 ==========

  private estimateTokenCount(messages: any[]): number {
    let count = 0;
    for (const msg of messages) {
      if (typeof msg.content === 'string') count += Math.ceil(msg.content.length / 4);
      else if (Array.isArray(msg.content)) { for (const block of msg.content) { if (block.type === 'text') count += Math.ceil(block.text.length / 4); else if (block.type === 'image_url') count += 1105; } }
      if (msg.attachments) { for (const att of msg.attachments) { if (att.isImage) count += 1105; } }
      if (msg.toolCalls) count += JSON.stringify(msg.toolCalls).length / 4;
    }
    return Math.ceil(count);
  }

  // ========== 对话压缩总结 ==========

  private async summarizeConversation(session: AgentSession, skillsContent?: string): Promise<void> {
    this.logger.log(`开始压缩总结对话 (当前约 ${this.estimateTokenCount(session.messages)} tokens)`);

    const compactPrompt = `你的任务是为到目前为止的对话创建一个详细的总结。
这个总结应该彻底记录技术细节、代码模式和架构决策。

请遵循以下结构：
1. 主要请求与意图：详细捕捉用户的所有明确请求和意图。
2. 关键技术概念：列出讨论过的所有重要技术概念、技术和框架。
3. 文件与代码段：列出检查、修改或创建的具体文件和代码段。
4. 错误与修复：列出遇到的所有错误以及你是如何修复它们的。
5. 待办任务：列出用户明确要求你处理的任何待办工作。
6. 当前工作：详细描述在这次总结请求之前正在进行的具体工作。

请直接返回 <summary>...</summary> 块，不要包含任何额外的客套话。`;

    try {
      const TARGET_KEEP = 15;
      let cutIndex = Math.max(0, session.messages.length - TARGET_KEEP);
      while (cutIndex > 0 && session.messages[cutIndex].role !== 'user') cutIndex--;
      if (cutIndex <= 3) { this.logger.log('未找到合适的切割点，跳过总结'); return; }

      const messagesToSummarize = session.messages.slice(0, cutIndex);
      const messagesToKeep = session.messages.slice(cutIndex);

      this.logger.log(`安全压缩: 保留 ${messagesToKeep.length} 条, 总结 ${messagesToSummarize.length} 条`);

      const msgs: any[] = [
        { role: 'system', content: this.buildSystemPrompt(session.skill, skillsContent) },
        ...messagesToSummarize.map(m => {
          if (m.role === 'assistant') {
            let content = m.content || '';
            if (m.toolCalls?.length) content += '\n' + m.toolCalls.map((tc: any) => `[Tool Call: ${tc.function?.name || tc.name}]`).join('\n');
            return { role: 'assistant', content: content.trim() };
          } else if (m.role === 'tool') return { role: 'user', content: `[工具结果 (${m.toolName || 'unknown'})]: ${m.content}` };
          return { role: m.role, content: m.content || '' };
        }),
        { role: 'user', content: compactPrompt },
      ];

      const response = await fetch(`${this.llmConfig.baseUrl.replace(/\/chat\/completions\/?$/, '')}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.llmConfig.apiKey}` },
        body: JSON.stringify({ model: this.llmConfig.model, messages: msgs, stream: false }),
      });

      if (!response.ok) throw new Error(`总结失败: ${response.status}`);
      const data = await response.json() as any;
      const summaryContent = data.choices?.[0]?.message?.content || '';
      const summaryMatch = summaryContent.match(/<summary>([\s\S]*?)<\/summary>/) || [null, summaryContent];
      const finalSummary = summaryMatch[1] || summaryContent;

      const compressedMessage: Message = {
        id: this.generateId(), role: 'user',
        content: `【历史对话核心总结（自动压缩）】：\n\n${finalSummary.trim()}\n\n[以上总结了较早的交互，后续为保留的活跃上下文]`,
        timestamp: Date.now(),
      };
      session.messages = [compressedMessage, ...messagesToKeep];
      this.logger.log(`✅ 对话压缩成功，保留了 ${messagesToKeep.length} 条活跃消息`);
    } catch (e: any) {
      this.logger.error(`对话压缩出错: ${e.message}`);
      const MAX_KEEP = 10;
      const keptMessages = session.messages.slice(-MAX_KEEP);
      const firstUserIndex = keptMessages.findIndex(m => m.role === 'user');
      session.messages = firstUserIndex >= 0 ? keptMessages.slice(firstUserIndex) : keptMessages;
      this.logger.warn(`回退硬截断，保留 ${session.messages.length} 条`);
    }
  }

  // ========== 会话标题生成 ==========

  private generateSessionTitle(session: AgentSession, firstMessage: string) {
    const cleanMsg = firstMessage.replace(/【.*?】/g, '').trim();
    session.title = cleanMsg.substring(0, 15) || '新会话';
    if (this.llmConfig.apiKey) this.generateSessionTitleFromLLM(session, cleanMsg);
  }

  private async generateSessionTitleFromLLM(session: AgentSession, message: string) {
    try {
      const prompt = `根据用户输入生成一个极简标题（不超过 8 个字）：\n\n"${message.substring(0, 50)}"\n\n直接输出标题，不要标点。`;
      const response = await fetch(`${this.llmConfig.baseUrl.replace(/\/chat\/completions\/?$/, '')}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.llmConfig.apiKey}` },
        body: JSON.stringify({ model: this.llmConfig.model, messages: [{ role: 'user', content: prompt }], stream: false, max_tokens: 20 }),
      });
      if (response.ok) {
        const data = await response.json() as any;
        let title = (data.choices?.[0]?.message?.content || '').replace(/[《》【】\[\]\s"]/g, '');
        if (title) { session.title = title; this.saveSessionImmediate(session).catch(() => {}); }
      }
    } catch {}
  }

  // ========== 文件上传服务 ==========

  public async uploadFileToService(filePath: string, originalName: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(buffer)]), originalName);

    const response = await fetch(`${this.fileManageConfig.url}/upload`, {
      method: 'POST', headers: { 'x-api-key': this.fileManageConfig.apiKey }, body: form,
    });
    if (!response.ok) throw new Error(`文件服务错误: ${response.status}`);
    const data = await response.json() as any;
    if (!data.success || !data.url) throw new Error(`文件服务返回异常: ${JSON.stringify(data)}`);
    return data.url;
  }

  // ========== 工具方法 ==========

  private generateId(): string { return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; }
}
