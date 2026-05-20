import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleCreateDto, RolePageListDto, RoleUpdateDto } from './dto/create-role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('角色管理')
@Controller('role')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
export class RoleController {
  constructor(private readonly service: RoleService) { }

  @ApiOperation({ summary: '创建角色' })
  @Post('create')
  async create(@Body() dto: RoleCreateDto) {
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新角色' })
  @Post('update')
  async update(@Body() dto: RoleUpdateDto) {
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取角色列表' })
  @Post('page')
  async list(@Body() dto: RolePageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取角色详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除角色' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '获取所有角色列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }


}
