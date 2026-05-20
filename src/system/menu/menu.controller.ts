import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuCreateDto, MenuPageListDto, MenuUpdateDto } from './dto/create-menu.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@ApiTags('菜单管理')
@Controller('menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) 
export class MenuController {
  constructor(private readonly service: MenuService) { }

  @ApiOperation({ summary: '创建菜单' })
  @Post('create')
  async create(@Body() dto: MenuCreateDto) {
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新菜单' })
  @Post('update')
  async update(@Body() dto: MenuUpdateDto) {
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取菜单列表' })
  @Post('page')
  async list(@Body() dto: MenuPageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取菜单详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除菜单' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '获取所有菜单列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }

  @ApiOperation({ summary: '获取菜单树结构' })
  @Post('findTree')
  async findTree() {
    return await this.service.findTree();
  }

}
