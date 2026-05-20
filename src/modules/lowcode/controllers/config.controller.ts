import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ConfigService } from '../services/config.service';
import { ConfigCreateDto, ConfigUpdateDto } from '../dto/config.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../system/auth/jwt-auth.guard';

@ApiTags('低代码配置管理')
@Controller('config')
export class ConfigController {
  constructor(private readonly service: ConfigService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('save')
  @ApiOperation({ summary: '保存配置（新增或更新）' })
  async save(@Body() dto: ConfigCreateDto, @Req() request: any) {
    const userid = request.user.id;
    return await this.service.createOrUpdate(dto, userid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my')
  @ApiOperation({ summary: '获取当前用户配置' })
  async getMyConfig(@Req() request: any) {
    const userid = request.user.id;
    return await this.service.findByUserId(userid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('list')
  @ApiOperation({ summary: '获取所有配置列表' })
  async findAll() {
    return await this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取配置详情' })
  async detail(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('update')
  @ApiOperation({ summary: '更新配置' })
  async update(@Body() dto: ConfigUpdateDto, @Req() request: any) {
    const userid = request.user.id;
    return await this.service.update(dto, userid);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除配置' })
  async delete(@Param('id') id: string) {
    return await this.service.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('user/my')
  @ApiOperation({ summary: '删除当前用户配置' })
  async deleteMyConfig(@Req() request: any) {
    const userid = request.user.id;
    return await this.service.removeByUserId(userid);
  }
} 