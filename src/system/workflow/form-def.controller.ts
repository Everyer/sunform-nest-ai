import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FormDefService } from './form-def.service';
import { CreateFormDefDto, UpdateFormDefDto, FormDefPageListDto } from './dto/form-def.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('流程表单定义')
@Controller('workflow/form-def')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FormDefController {
  constructor(private readonly service: FormDefService) {}

  @ApiOperation({ summary: '创建表单定义' })
  @Post('create')
  async create(@Body() dto: CreateFormDefDto) {
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新表单定义' })
  @Post('update')
  async update(@Body() dto: UpdateFormDefDto) {
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取表单定义列表' })
  @Post('page')
  async list(@Body() dto: FormDefPageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取所有表单定义' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }

  @ApiOperation({ summary: '获取表单定义详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除表单定义' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }
}
