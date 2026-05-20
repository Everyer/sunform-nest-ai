import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingCreateDto, OnboardingUpdateDto, OnboardingPageListDto } from './dto/create-onboarding.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../system/auth/jwt-auth.guard';
import { DataScopeService } from '../../system/auth/data-scope.service';

@ApiTags('入职用户信息管理')
@Controller('onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(
    private readonly service: OnboardingService,
    private readonly dataScope: DataScopeService,
  ) { }

  @ApiOperation({ summary: '创建入职' })
  @Post('create')
  async create(@Body() dto: OnboardingCreateDto, @Req() req: any) {
    return await this.service.create({ ...dto, createBy: req.user.id });
  }

  @ApiOperation({ summary: '更新入职申请' })
  @Post('update')
  async update(@Body() dto: OnboardingUpdateDto) {
    return await this.service.update(dto);
  }

  @ApiOperation({ summary: '分页获取入职列表' })
  @Post('page')
  async list(@Body() dto: OnboardingPageListDto, @Req() req: any) {
    const createByWhere = await this.dataScope.buildCreateByWhere(req.user);
    return await this.service.findPageList(dto, createByWhere);
  }

  @ApiOperation({ summary: '获取入职详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiOperation({ summary: '删除入职记录' })
  @Post('delete')
  async delete(@Body() dto: { id: string }) {
    return await this.service.remove(dto.id);
  }

  @ApiOperation({ summary: '获取所有入职列表' })
  @Post('list')
  async findAll() {
    return await this.service.findAll();
  }

}
