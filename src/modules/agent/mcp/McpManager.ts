import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Logger } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";

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

export class McpManager {
  private readonly logger = new Logger(McpManager.name);
  private clients: Map<string, { client: Client; transport: StdioClientTransport }> = new Map();
  private readonly mcpConfigFile: string;

  constructor(configDir: string) {
    this.mcpConfigFile = path.join(configDir, ".mcp.json");
  }

  async init() {
    this.logger.log("正在初始化 MCP 管理器...");
    const configs = await this.getConfigs();
    for (const [name, config] of Object.entries(configs)) {
      try {
        await this.connectServer(name, config);
      } catch (error: any) {
        this.logger.error(`无法连接到 MCP 服务器 ${name}: ${error.message}`);
      }
    }
  }

  private async getConfigs(): Promise<Record<string, McpServerConfig>> {
    try {
      const content = await fs.readFile(this.mcpConfigFile, "utf-8");
      const json = JSON.parse(content);
      return json.mcpServers || {};
    } catch {
      return {};
    }
  }

  public async connectServer(name: string, config: McpServerConfig) {
    if (this.clients.has(name)) {
      await this.disconnectServer(name);
    }

    if (config.type !== "stdio") {
      this.logger.warn(`目前仅支持 stdio 类型的 MCP 服务器: ${name}`);
      return;
    }

    if (!config.command) {
      this.logger.warn(`MCP 服务器 ${name} 缺少 command 配置`);
      return;
    }

    this.logger.log(`正在启动 MCP 服务器: ${name} (${config.command} ${config.args?.join(" ") || ""})`);

    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args || [],
      env: Object.fromEntries(Object.entries({ ...process.env, ...config.env }).filter(([_, v]) => v !== undefined)) as Record<string, string>,
    });

    const client = new Client(
      { name: "common-agent-client", version: "1.0.0" },
      { capabilities: {} }
    );

    try {
      await client.connect(transport);
      this.clients.set(name, { client, transport });
      this.logger.log(`成功连接到 MCP 服务器: ${name}`);
    } catch (error: any) {
      this.logger.error(`连接 MCP 服务器 ${name} 失败: ${error.message}`);
      throw error;
    }
  }

  public async disconnectServer(name: string) {
    const entry = this.clients.get(name);
    if (entry) {
      try {
        await entry.transport.close();
        this.logger.log(`已断开 MCP 服务器: ${name}`);
      } catch (error: any) {
        this.logger.error(`断开 MCP 服务器 ${name} 时出错: ${error.message}`);
      }
      this.clients.delete(name);
    }
  }

  async getAllTools(): Promise<ToolDefinition[]> {
    const allTools: ToolDefinition[] = [];

    for (const [serverName, { client }] of this.clients.entries()) {
      try {
        const response = await client.listTools();
        for (const mcpTool of response.tools) {
          allTools.push({
            name: `${serverName}:${mcpTool.name}`,
            description: `[MCP: ${serverName}] ${mcpTool.description}`,
            parameters: mcpTool.inputSchema as any,
            inputSchema: { parse: (input: any) => input },
            execute: async (input: any, context: ToolUseContext) => {
              this.logger.log(`执行 MCP 工具: ${serverName}:${mcpTool.name}`);
              try {
                const callPromise = client.callTool(
                  { name: mcpTool.name, arguments: input },
                  undefined,
                  { timeout: 300000 }
                );
                callPromise.catch(() => {});

                const timeoutPromise = new Promise((_, reject) => {
                  const timer = setTimeout(() => reject(new Error(`MCP 工具执行超时 (120s): ${serverName}:${mcpTool.name}`)), 120000);
                  callPromise.finally(() => clearTimeout(timer));
                });

                const result = await Promise.race([callPromise, timeoutPromise]) as any;
                if (result.isError) {
                  throw new Error(JSON.stringify(result.content));
                }
                return result.content;
              } catch (execError: any) {
                this.logger.error(`MCP 工具执行失败: ${serverName}:${mcpTool.name} - ${execError.message}`);
                if (execError.message.includes("Broken pipe") || execError.message.includes("connection lost")) {
                  this.logger.warn(`检测到 MCP 连接丢失，正尝试重新初始化...`);
                  this.connectServer(serverName, (await this.getConfigs())[serverName]).catch(() => {});
                }
                return [{ type: "text", text: `工具执行失败: ${execError.message}` }];
              }
            },
          });
        }
      } catch (error: any) {
        this.logger.error(`解析服务器 ${serverName} 的工具失败: ${error.message}`);
      }
    }

    return allTools;
  }

  async shutdown() {
    for (const [name, { transport }] of this.clients.entries()) {
      try {
        await transport.close();
        this.logger.log(`已关闭 MCP 服务器: ${name}`);
      } catch (error: any) {
        this.logger.error(`关闭 MCP 服务器 ${name} 时出错: ${error.message}`);
      }
    }
    this.clients.clear();
  }
}
