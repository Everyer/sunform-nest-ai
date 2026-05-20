import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LowcodeLogService } from '../services/lowcode-log.service';
import { LowcodeLogCreateDto, LowcodeLogPageListDto, LowcodeLogByCodeDto, LowcodeLogPageByCodeDto, LowcodeLogUpdateRemarkDto } from '../dto/lowcode-log.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../system/auth/jwt-auth.guard';

@ApiTags('低代码日志管理')
@Controller('lowcodeLog')
export class LowcodeLogController {
  constructor(private readonly service: LowcodeLogService) { }

  @Post('create')
  @ApiOperation({ summary: '创建低代码日志' })
  async create(@Body() dto: LowcodeLogCreateDto) {
    return await this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('page')
  @ApiOperation({ summary: '分页查询低代码日志列表' })
  async list(@Body() dto: LowcodeLogPageListDto) {
    return await this.service.findPageList(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('detail')
  @ApiOperation({ summary: '获取低代码日志详情' })
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('delete')
  @ApiOperation({ summary: '删除低代码日志(仅管理员)' })
  async delete(@Body() dto: { id: string }, @Req() request: any) {
    return await this.service.remove(dto.id, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('list')
  @ApiOperation({ summary: '获取所有低代码日志列表' })
  async findAll() {
    return await this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('listByCode')
  @ApiOperation({ summary: '根据低代码code获取所有日志' })
  async findByCode(@Body() dto: LowcodeLogByCodeDto) {
    return await this.service.findByCode(dto.componentCode);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('pageByCode')
  @ApiOperation({ summary: '根据低代码code分页查询日志' })
  async findPageByCode(@Body() dto: LowcodeLogPageByCodeDto) {
    return await this.service.findPageListByCode(dto.componentCode, dto.pageindex, dto.pagesize);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('updateRemark')
  @ApiOperation({ summary: '更新日志备注' })
  async updateRemark(@Body() dto: LowcodeLogUpdateRemarkDto) {
    return await this.service.updateRemark(dto);
  }
} 