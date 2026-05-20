import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Req } from '@nestjs/common';
import { PageService } from '../services/page.service';
import { PageCreateDto, PagePageListDto, PageUpdateDto } from '../dto/page.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../system/auth/jwt-auth.guard';

@ApiTags('页面管理')
@Controller('page')
export class PageController {
  constructor(private readonly service: PageService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiOperation({ summary: '创建页面' })
  async create(@Body() dto: PageCreateDto) {
    return await this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('update')
  @ApiOperation({ summary: '更新页面' })
  async update(@Body() dto: PageUpdateDto) {
    return await this.service.update(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('page')
  @ApiOperation({ summary: '分页查询页面列表' })
  async list(@Body() dto: PagePageListDto) {
    return await this.service.findPageList(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('detail')
  @ApiOperation({ summary: '获取页面详情' })
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('delete')
  @ApiOperation({ summary: '删除页面' })
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('list')
  @ApiOperation({ summary: '获取所有页面列表' })
  async findAll(@Req() request: any) {
    const userid = request.user.id
    return await this.service.findAll(userid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('listByProject')
  @ApiOperation({ summary: '根据项目ID获取页面列表' })
  async findByProjectId(@Body() dto: { projectId: string }) {
    return await this.service.findByProjectId(dto.projectId);
  }
} 