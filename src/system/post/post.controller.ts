import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreateDto, PageListDto, UpdateDto } from './dto/create-post.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('岗位管理')
@Controller('post')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
export class PostController {
  constructor(private readonly service: PostService) { }

  @ApiOperation({ summary: '创建岗位' })
  @Post('create')
  async create(@Body() dto: CreateDto) {
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新岗位' })
  @Post('update')
  async update(@Body() dto: UpdateDto) {
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取岗位列表' })
  @Post('page')
  async list(@Body() dto: PageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取岗位详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除岗位' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '获取所有岗位列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }


}
