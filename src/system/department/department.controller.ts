import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentCreateDto, DepartmentPageListDto, DepartmentUpdateDto } from './dto/create-department.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('部门管理')
@Controller('department')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DepartmentController {
  constructor(
    private readonly service: DepartmentService,
  ) { }

  @ApiOperation({ summary: '创建部门' })
  @Post('create')
  async create(@Body() dto: DepartmentCreateDto) {
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新部门' })
  @Post('update')
  async update(@Body() dto: DepartmentUpdateDto) {
    console.log(dto)
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取部门列表' })
  @Post('page')
  async list(@Body() dto: DepartmentPageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取部门详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除部门' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '获取所有部门列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }

  @ApiOperation({ summary: '获取部门树结构' })
  @Post('findTree')
  async findTree() {
    return await this.service.findTree();
  }

}
