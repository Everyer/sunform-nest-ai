import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserSurveyService } from './user-survey.service';
import { UserSurveyCreateDto, UserSurveyPageListDto, UserSurveyUpdateDto } from './dto/create-user-survey.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../system/auth/jwt-auth.guard';
import { DataScopeService } from '../../system/auth/data-scope.service';

@ApiTags('用户台账信息管理')
@Controller('userSurvey')
export class UserSurveyController {
  constructor(
    private readonly service: UserSurveyService,
    private readonly dataScope: DataScopeService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建台账' })
  @Post('create')
  async create(@Body() dto: UserSurveyCreateDto, @Req() req: any) {
    return await this.service.create({ ...dto, createBy: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新台账信息' })
  @Post('update')
  async update(@Body() dto: UserSurveyUpdateDto) {
    return await this.service.update(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '分页获取台账列表' })
  @Post('page')
  async list(@Body() dto: UserSurveyPageListDto, @Req() req: any) {
    const createByWhere = await this.dataScope.buildCreateByWhere(req.user);
    return await this.service.findPageList(dto, createByWhere);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取台账详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除台账记录' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有台账列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }

}
