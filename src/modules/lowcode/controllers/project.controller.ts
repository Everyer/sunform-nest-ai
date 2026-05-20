import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Req, ConsoleLogger } from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { ProjectCreateDto, ProjectPageListDto, ProjectUpdateDto } from '../dto/project.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../system/auth/jwt-auth.guard';

@ApiTags('项目管理')
@Controller('project')
export class ProjectController {
  constructor(private readonly service: ProjectService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiOperation({ summary: '创建项目' })
  async create(@Body() dto: ProjectCreateDto) {
    return await this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('update')
  @ApiOperation({ summary: '更新项目' })
  async update(@Body() dto: ProjectUpdateDto) {
    return await this.service.update(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('page')
  @ApiOperation({ summary: '分页查询项目列表' })
  async list(@Body() dto: ProjectPageListDto) {
    return await this.service.findPageList(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('detail')
  @ApiOperation({ summary: '获取项目详情' })
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('delete')
  @ApiOperation({ summary: '删除项目' })
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('list')
  @ApiOperation({ summary: '获取所有项目列表' })
  async findAll(@Req() request: any) {
    const userid = request.user.id
    return await this.service.findAll(userid);
  }
} 