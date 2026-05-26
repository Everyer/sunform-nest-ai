import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../system/auth/jwt-auth.guard';
import { PrintTemplateService } from '../services/print-template.service';
import { PrintTemplateCreateDto, PrintTemplatePageListDto, PrintTemplateUpdateDto } from '../dto/print-template.dto';

@ApiTags('打印模板管理')
@Controller('print-template')
export class PrintTemplateController {
  constructor(private readonly service: PrintTemplateService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiOperation({ summary: '创建打印模板' })
  async create(@Body() dto: PrintTemplateCreateDto, @Req() req: any) {
    const userId = req.user.id;
    return await this.service.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('update')
  @ApiOperation({ summary: '更新修改打印模板' })
  async update(@Body() dto: PrintTemplateUpdateDto, @Req() req: any) {
    const userId = req.user.id;
    return await this.service.update(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('page')
  @ApiOperation({ summary: '分页查询打印模板列表' })
  async list(@Body() dto: PrintTemplatePageListDto) {
    return await this.service.findPageList(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('detail')
  @ApiOperation({ summary: '获取打印模板配置详情' })
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  // 开放接口给其它项目：直接通过 templateId 获取模板
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('getByCode')
  @ApiOperation({ summary: '外部项目根据代码动态拉取打印配置' })
  async getByCode(@Body() dto: { templateId: string, appId?: string }) {
    return await this.service.findByTemplateId(dto.templateId, dto.appId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('delete')
  @ApiOperation({ summary: '删除打印模板' })
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }
}
