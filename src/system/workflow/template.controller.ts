import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplatePageListDto, PublishTemplateDto } from './dto/template.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('流程模板')
@Controller('workflow/template')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TemplateController {
  constructor(private readonly service: TemplateService) {}

  @ApiOperation({ summary: '创建模板' })
  @Post('create')
  async create(@Body() dto: CreateTemplateDto) {
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新模板' })
  @Post('update')
  async update(@Body() dto: UpdateTemplateDto) {
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取模板列表' })
  @Post('page')
  async list(@Body() dto: TemplatePageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取所有已发布模板' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }

  @ApiOperation({ summary: '获取模板详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除模板' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '发布模板' })
  @Post('publish')
  async publish(@Body() dto: PublishTemplateDto) {
    return await this.service.publish(dto.id);
  }

  @ApiOperation({ summary: '停用模板' })
  @Post('deactivate')
  async deactivate(@Body() dto: { id: string }) {
    return await this.service.deactivate(dto.id);
  }
}
