"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AgentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const path = require("path");
const agent_service_1 = require("./agent.service");
let AgentController = AgentController_1 = class AgentController {
    constructor(agentService) {
        this.agentService = agentService;
        this.logger = new common_1.Logger(AgentController_1.name);
    }
    createSession() {
        const session = this.agentService.createSession();
        this.logger.log(`创建会话: ${session.id}`);
        return { sessionId: session.id };
    }
    abortSession(dto) {
        this.agentService.abortSession(dto.sessionId);
        return { success: true };
    }
    closeSession(dto) {
        this.agentService.closeSession(dto.sessionId);
        return { success: true };
    }
    async sendMessage(dto, res) {
        const { sessionId, content, sourceCode, skill, formFields, flowNodes, fieldPermissions, attachments, availableActions, } = dto;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        if (res.socket)
            res.socket.setNoDelay(true);
        this.agentService.abortSession(sessionId);
        try {
            for await (const event of this.agentService.processMessage(sessionId, content, sourceCode, skill, formFields, flowNodes, fieldPermissions, attachments, availableActions)) {
                if (event.type === 'error') {
                    res.write(`event: error\ndata: ${JSON.stringify({ error: event.error })}\n\n`);
                }
                else if (event.type === 'done') {
                    res.write(`event: done\ndata: ${JSON.stringify({})}\n\n`);
                }
                else {
                    res.write(`event: stream\ndata: ${JSON.stringify({ event })}\n\n`);
                }
            }
        }
        catch (error) {
            res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
        }
        res.end();
    }
    async listHistory() { return this.agentService.listHistory(); }
    async loadHistory(id) {
        const session = await this.agentService.loadHistory(id);
        if (!session)
            return { error: 'History not found' };
        return { sessionId: session.id, title: session.title, messages: session.messages };
    }
    async deleteHistory(id) { return this.agentService.deleteHistory(id); }
    async clearAllHistory() { return this.agentService.clearAllHistory(); }
    async getConfig() { return this.agentService.getLlmConfig(); }
    async updateConfig(body) { return this.agentService.updateLlmConfig(body); }
    async getMcpConfigs() {
        return this.agentService.getMcpConfigs();
    }
    async addMcpConfig(body) {
        return this.agentService.addMcpConfig(body.name, body.config);
    }
    async deleteMcpConfig(body) {
        return this.agentService.deleteMcpConfig(body.name);
    }
    async refreshMcpTools() {
        await this.agentService.refreshMcpTools();
        return { success: true };
    }
    async uploadFile(file) {
        this.logger.log(`文件已上传: ${file.originalname} -> ${file.filename}, path: ${file.path}`);
        let url = '';
        try {
            url = await this.agentService.uploadFileToService(file.path, file.originalname);
            this.logger.log(`文件服务上传成功: ${file.originalname} -> ${url}`);
        }
        catch (e) {
            this.logger.error(`文件服务上传失败: ${e.message}`, e.stack);
        }
        return { success: true, name: file.originalname, path: file.filename, url };
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Post)('session'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('abort'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "abortSession", null);
__decorate([
    (0, common_1.Post)('close'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "closeSession", null);
__decorate([
    (0, common_1.Post)('message'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "listHistory", null);
__decorate([
    (0, common_1.Get)('history/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "loadHistory", null);
__decorate([
    (0, common_1.Post)('history/delete/:id'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "deleteHistory", null);
__decorate([
    (0, common_1.Post)('history/clear-all'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "clearAllHistory", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)('mcp/config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getMcpConfigs", null);
__decorate([
    (0, common_1.Post)('mcp/config/add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "addMcpConfig", null);
__decorate([
    (0, common_1.Post)('mcp/config/delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "deleteMcpConfig", null);
__decorate([
    (0, common_1.Post)('mcp/tools/refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "refreshMcpTools", null);
__decorate([
    (0, common_1.Post)('attachments/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        dest: path.join(process.cwd(), 'temp_attachments'),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "uploadFile", null);
exports.AgentController = AgentController = AgentController_1 = __decorate([
    (0, common_1.Controller)('agent'),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map