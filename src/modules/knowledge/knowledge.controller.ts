import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../system/auth/jwt-auth.guard';

@ApiTags('知识库管理')
@Controller('knowledge')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  // === 知识库库级 API ===
  
  @ApiOperation({ summary: '创建知识库' })
  @Post('base/create')
  async createBase(@Body() dto: { name: string; description?: string }) {
    return {
      success: true,
      data: await this.service.createBase(dto.name, dto.description),
    };
  }

  @ApiOperation({ summary: '获取全部知识库' })
  @Get('base/list')
  async listBases() {
    return {
      success: true,
      data: await this.service.listBases(),
    };
  }

  @ApiOperation({ summary: '更新知识库' })
  @Post('base/update')
  async updateBase(@Body() dto: { id: string; name: string; description?: string }) {
    return {
      success: true,
      data: await this.service.updateBase(dto.id, dto.name, dto.description),
    };
  }

  @ApiOperation({ summary: '删除知识库' })
  @Post('base/delete')
  async deleteBase(@Body() dto: { id: string }) {
    await this.service.deleteBase(dto.id);
    return {
      success: true,
      message: '知识库删除成功',
    };
  }

  // === 文档级 API ===

  @ApiOperation({ summary: '获取知识库关联的所有文档列表' })
  @Get('document/list')
  async listDocuments(@Query('baseId') baseId: string) {
    return {
      success: true,
      data: await this.service.listDocuments(baseId),
    };
  }

  @ApiOperation({ summary: '获取所有知识库下的所有文档（含 baseName），用于全局文档管理' })
  @Get('document/listAll')
  async listAllDocuments() {
    return {
      success: true,
      data: await this.service.listAllDocuments(),
    };
  }

  @ApiOperation({ summary: '上传并解析新文档' })
  @Post('document/upload')
  async uploadDocument(@Body() dto: { baseId: string; title: string; content: string; type: string }) {
    const contentText = dto.content || '';
    const sizeInBytes = Buffer.byteLength(contentText, 'utf8');
    const doc = await this.service.uploadAndParseDocument(
      dto.baseId,
      dto.title,
      contentText,
      dto.type || 'txt',
      sizeInBytes
    );
    return {
      success: true,
      data: doc,
    };
  }

  @ApiOperation({ summary: '删除文档' })
  @Post('document/delete')
  async deleteDocument(@Body() dto: { id: string }) {
    await this.service.deleteDocument(dto.id);
    return {
      success: true,
      message: '文档已删除',
    };
  }

  // === 切片及向量检索 API ===

  @ApiOperation({ summary: '获取文档的所有解析切片数据' })
  @Get('document/chunks')
  async getDocumentChunks(@Query('documentId') documentId: string) {
    return {
      success: true,
      data: await this.service.getDocumentChunks(documentId),
    };
  }

  @ApiOperation({ summary: '知识库向量相似度高保真检索' })
  @Post('search')
  async searchSimilarChunks(@Body() dto: { baseId: string; queryText: string; limit?: number }) {
    const results = await this.service.searchSimilarChunksInBase(
      dto.baseId,
      dto.queryText,
      dto.limit || 5
    );
    return {
      success: true,
      data: results,
    };
  }
}
