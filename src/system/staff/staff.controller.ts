import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffCreateDto, StaffPageListDto, StaffUpdateDto } from './dto/create-staff.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('员工管理')
@Controller('staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(
    private readonly service: StaffService,
  ) { }

  @ApiOperation({ summary: '创建员工' })
  @Post('create')
  async create(@Body() dto: StaffCreateDto) {
    console.log(dto);
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新员工' })
  @Post('update')
  async update(@Body() dto: StaffUpdateDto) {
    console.log(dto)
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取员工列表' })
  @Post('page')
  async list(@Body() dto: StaffPageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取员工详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除员工' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '获取所有员工列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }


}
