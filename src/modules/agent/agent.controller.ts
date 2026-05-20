import {
  Controller, Post, Get, Body, Res, HttpCode, Logger,
  UseInterceptors, UploadedFile, Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

  // ========== Session ==========

  @Post('session')
  @HttpCode(200)
  createSession() {
    const session = this.agentService.createSession();
    this.logger.log(`创建会话: ${session.id}`);
    return { sessionId: session.id };
  }

  @Post('abort')
  abortSession(@Body() dto: { sessionId: string }) {
    this.agentService.abortSession(dto.sessionId);
    return { success: true };
  }

  @Post('close')
  closeSession(@Body() dto: { sessionId: string }) {
    this.agentService.closeSession(dto.sessionId);
    return { success: true };
  }

  // ========== Message (SSE Streaming) ==========

  @Post('message')
  async sendMessage(
    @Body() dto: {
      sessionId: string;
      content: string;
      sourceCode?: string;
      skill?: string;
      formFields?: any[];
      flowNodes?: any[];
      fieldPermissions?: any;
      attachments?: { name: string; path: string }[];
      availableActions?: string[];
    },
    @Res() res: Response,
  ) {
    const {
      sessionId,
      content,
      sourceCode,
      skill,
      formFields,
      flowNodes,
      fieldPermissions,
      attachments,
      availableActions,
    } = dto;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    // 禁用 Nagle 算法，确保 SSE 数据立即发送
    if (res.socket) res.socket.setNoDelay(true);

    this.agentService.abortSession(sessionId);

    try {
      for await (const event of this.agentService.processMessage(
        sessionId,
        content,
        sourceCode,
        skill,
        formFields,
        flowNodes,
        fieldPermissions,
        attachments,
        availableActions,
      )) {
        if (event.type === 'error') {
          res.write(`event: error\ndata: ${JSON.stringify({ error: event.error })}\n\n`);
        } else if (event.type === 'done') {
          res.write(`event: done\ndata: ${JSON.stringify({})}\n\n`);
        } else {
          res.write(`event: stream\ndata: ${JSON.stringify({ event })}\n\n`);
        }
      }
    } catch (error: any) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    }
    res.end();
  }

  // ========== History ==========

  @Get('history')
  async listHistory() { return this.agentService.listHistory(); }

  @Get('history/:id')
  async loadHistory(@Param('id') id: string) {
    const session = await this.agentService.loadHistory(id);
    if (!session) return { error: 'History not found' };
    return { sessionId: session.id, title: session.title, messages: session.messages };
  }

  @Post('history/delete/:id')
  @HttpCode(200)
  async deleteHistory(@Param('id') id: string) { return this.agentService.deleteHistory(id); }

  @Post('history/clear-all')
  @HttpCode(200)
  async clearAllHistory() { return this.agentService.clearAllHistory(); }

  // ========== Config ==========

  @Get('config')
  async getConfig() { return this.agentService.getLlmConfig(); }

  @Post('config')
  async updateConfig(@Body() body: any) { return this.agentService.updateLlmConfig(body); }

  // ========== MCP Config ==========

  @Get('mcp/config')
  async getMcpConfigs() {
    return this.agentService.getMcpConfigs();
  }

  @Post('mcp/config/add')
  async addMcpConfig(@Body() body: { name: string; config: any }) {
    return this.agentService.addMcpConfig(body.name, body.config);
  }

  @Post('mcp/config/delete')
  async deleteMcpConfig(@Body() body: { name: string }) {
    return this.agentService.deleteMcpConfig(body.name);
  }

  @Post('mcp/tools/refresh')
  async refreshMcpTools() {
    await this.agentService.refreshMcpTools();
    return { success: true };
  }

  // ========== Attachments ==========

  @Post('attachments/upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: path.join(process.cwd(), 'temp_attachments'),
  }))
  async uploadFile(@UploadedFile() file: any) {
    this.logger.log(`文件已上传: ${file.originalname} -> ${file.filename}, path: ${file.path}`);

    let url = '';

    // 所有文件都尝试上传到文件管理服务（不仅限图片）
    try {
      url = await this.agentService.uploadFileToService(file.path, file.originalname);
      this.logger.log(`文件服务上传成功: ${file.originalname} -> ${url}`);
    } catch (e: any) {
      this.logger.error(`文件服务上传失败: ${e.message}`, e.stack);
    }

    return { success: true, name: file.originalname, path: file.filename, url };
  }
}
