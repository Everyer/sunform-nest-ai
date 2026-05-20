import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { DictService } from './dict.service';
import { DictCreateDto, DictPageListDto, DictUpdateDto } from './dto/create-dict.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('字典管理')
@Controller('dict')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
export class DictController {
  constructor(private readonly service: DictService) { }

  @ApiOperation({ summary: '创建字典项' })
  @Post('create')
  async create(@Body() dto: DictCreateDto) {
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新字典项' })
  @Post('update')
  async update(@Body() dto: DictUpdateDto) {
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取字典列表' })
  @Post('page')
  async list(@Body() dto: DictPageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取字典详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除字典项' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '获取所有字典项列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }

  @ApiOperation({ summary: '获取字典树结构' })
  @Post('findTree')
  async findTree() {
    return await this.service.findTree();
  }

  @ApiOperation({ summary: '根据编码获取字典列表' })
  @Post('findListByCode')
  async findListByCode(@Body() dto: { code: string }) {
    return await this.service.findListByCode(dto.code);
  }

}
