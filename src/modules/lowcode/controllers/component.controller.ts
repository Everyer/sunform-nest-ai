import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ComponentService } from '../services/component.service';
import { ComponentCreateDto, ComponentPageListDto, ComponentUpdateDto, GetConfigByOtherProjectDto, UpdateOperatorsDto } from '../dto/component.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../system/auth/jwt-auth.guard';
import { COMPONENT_TYPE_OPTIONS } from '../constants/component.constants';

@ApiTags('组件管理')
@Controller('component')
export class ComponentController {
  constructor(private readonly service: ComponentService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiOperation({ summary: '创建组件' })
  async create(@Body() dto: ComponentCreateDto) {
    return await this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('update')
  @ApiOperation({ summary: '更新组件' })
  async update(@Body() dto: ComponentUpdateDto, @Req() request: any) {
    return await this.service.update(dto, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('page')
  @ApiOperation({ summary: '分页查询组件列表' })
  async list(@Body() dto: ComponentPageListDto) {
    return await this.service.findPageList(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('detail')
  @ApiOperation({ summary: '获取组件详情' })
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }

  @ApiBearerAuth()
  @Post('detailById')
  @ApiOperation({ summary: '根据id获取组件详情' })
  async detailById(@Body() dto: { id: string }) {
    return await this.service.findComponentById(dto.id);
  }
  @ApiBearerAuth()
  @Post('detailByComponentCode')
  @ApiOperation({ summary: '根据组件编码获取组件详情' })
  async detailByComponentCode(@Body() dto: { componentCode: string }) {
    return await this.service.findComponentByComponentCode(dto.componentCode);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('delete')
  @ApiOperation({ summary: '删除组件(仅管理员)' })
  async delete(@Body() dto: { id: string }, @Req() request: any) {
    return await this.service.remove(dto.id, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('list')
  @ApiOperation({ summary: '获取所有组件列表' })
  async findAll() {
    return await this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('listByPage')
  @ApiOperation({ summary: '根据页面ID获取组件列表' })
  async findByPageId(@Body() dto: { pageId: string }) {
    return await this.service.findByPageId(dto.pageId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('listByProject')
  @ApiOperation({ summary: '根据项目ID获取组件列表' })
  async findByProjectId(@Body() dto: { projectId: string }) {
    return await this.service.findByProjectId(dto.projectId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('typeOptions')
  @ApiOperation({ summary: '获取组件类型选项' })
  async getComponentTypeOptions() {
    return {
      code: 0,
      message: '获取成功',
      success: true,
      data: COMPONENT_TYPE_OPTIONS
    };
  }

  @Post('getConfigByOtherProject')
  @ApiOperation({
    summary: '根据项目ID获取组件配置（跳过token验证）',
    description: '提供给其他系统调用的接口，无需token验证。通过项目ID和组件ID或组件代码获取组件配置信息。'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 0 },
        message: { type: 'string', example: '获取成功' },
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '组件ID' },
            componentCode: { type: 'string', description: '组件代码' },
            componentName: { type: 'string', description: '组件名称' },
            componentConfig: { type: 'object', description: '组件配置' }
          }
        }
      }
    }
  })
  async getConfigByOtherProject(@Body() dto: GetConfigByOtherProjectDto) {
    const result = await this.service.getConfigByOtherProject(dto);
    return result
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('updateOperators')
  @ApiOperation({ summary: '更新组件可操作人' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 0 },
        message: { type: 'string', example: '更新成功' },
        success: { type: 'boolean', example: true }
      }
    }
  })
  async updateOperators(@Body() dto: UpdateOperatorsDto, @Req() request: any) {
    await this.service.updateOperators(dto.id, dto.operatorIds, request.user);
    return {
      code: 0,
      message: '更新成功',
      success: true
    };
  }
} 