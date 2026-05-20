import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDto, UserPageListDto, UserUpdateDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('用户管理')
@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly service: UserService,
  ) { }

  @ApiOperation({ summary: '创建用户' })
  @Post('create')
  async create(@Body() dto: UserCreateDto) {
    return await this.service.create(dto);
  }

  @ApiOperation({ summary: '更新用户' })
  @Post('update')
  async update(@Body() dto: UserUpdateDto) {
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取用户列表' })
  @Post('page')
  async list(@Body() dto: UserPageListDto) {
    return await this.service.findPageList(dto);
  }

  @ApiOperation({ summary: '获取用户详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除用户' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '获取所有用户列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }


}
