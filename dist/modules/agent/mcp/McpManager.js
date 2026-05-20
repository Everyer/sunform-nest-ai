"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpManager = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
const common_1 = require("@nestjs/common");
const fs = require("fs/promises");
const path = require("path");
class McpManager {
    constructor(configDir) {
        this.logger = new common_1.Logger(McpManager.name);
        this.clients = new Map();
        this.mcpConfigFile = path.join(configDir, ".mcp.json");
    }
    async init() {
        this.logger.log("正在初始化 MCP 管理器...");
        const configs = await this.getConfigs();
        for (const [name, config] of Object.entries(configs)) {
            try {
                await this.connectServer(name, config);
            }
            catch (error) {
                this.logger.error(`无法连接到 MCP 服务器 ${name}: ${error.message}`);
            }
        }
    }
    async getConfigs() {
        try {
            const content = await fs.readFile(this.mcpConfigFile, "utf-8");
            const json = JSON.parse(content);
            return json.mcpServers || {};
        }
        catch {
            return {};
        }
    }
    async connectServer(name, config) {
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
        const transport = new stdio_js_1.StdioClientTransport({
            command: config.command,
            args: config.args || [],
            env: Object.fromEntries(Object.entries({ ...process.env, ...config.env }).filter(([_, v]) => v !== undefined)),
        });
        const client = new index_js_1.Client({ name: "common-agent-client", version: "1.0.0" }, { capabilities: {} });
        try {
            await client.connect(transport);
            this.clients.set(name, { client, transport });
            this.logger.log(`成功连接到 MCP 服务器: ${name}`);
        }
        catch (error) {
            this.logger.error(`连接 MCP 服务器 ${name} 失败: ${error.message}`);
            throw error;
        }
    }
    async disconnectServer(name) {
        const entry = this.clients.get(name);
        if (entry) {
            try {
                await entry.transport.close();
                this.logger.log(`已断开 MCP 服务器: ${name}`);
            }
            catch (error) {
                this.logger.error(`断开 MCP 服务器 ${name} 时出错: ${error.message}`);
            }
            this.clients.delete(name);
        }
    }
    async getAllTools() {
        const allTools = [];
        for (const [serverName, { client }] of this.clients.entries()) {
            try {
                const response = await client.listTools();
                for (const mcpTool of response.tools) {
                    allTools.push({
                        name: `${serverName}:${mcpTool.name}`,
                        description: `[MCP: ${serverName}] ${mcpTool.description}`,
                        parameters: mcpTool.inputSchema,
                        inputSchema: { parse: (input) => input },
                        execute: async (input, context) => {
                            this.logger.log(`执行 MCP 工具: ${serverName}:${mcpTool.name}`);
                            try {
                                const callPromise = client.callTool({ name: mcpTool.name, arguments: input }, undefined, { timeout: 300000 });
                                callPromise.catch(() => { });
                                const timeoutPromise = new Promise((_, reject) => {
                                    const timer = setTimeout(() => reject(new Error(`MCP 工具执行超时 (120s): ${serverName}:${mcpTool.name}`)), 120000);
                                    callPromise.finally(() => clearTimeout(timer));
                                });
                                const result = await Promise.race([callPromise, timeoutPromise]);
                                if (result.isError) {
                                    throw new Error(JSON.stringify(result.content));
                                }
                                return result.content;
                            }
                            catch (execError) {
                                this.logger.error(`MCP 工具执行失败: ${serverName}:${mcpTool.name} - ${execError.message}`);
                                if (execError.message.includes("Broken pipe") || execError.message.includes("connection lost")) {
                                    this.logger.warn(`检测到 MCP 连接丢失，正尝试重新初始化...`);
                                    this.connectServer(serverName, (await this.getConfigs())[serverName]).catch(() => { });
                                }
                                return [{ type: "text", text: `工具执行失败: ${execError.message}` }];
                            }
                        },
                    });
                }
            }
            catch (error) {
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
            }
            catch (error) {
                this.logger.error(`关闭 MCP 服务器 ${name} 时出错: ${error.message}`);
            }
        }
        this.clients.clear();
    }
}
exports.McpManager = McpManager;
//# sourceMappingURL=McpManager.js.map