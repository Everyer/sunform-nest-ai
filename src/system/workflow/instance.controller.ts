import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InstanceService } from './instance.service';
import { StartInstanceDto, ApproveInstanceDto, WithdrawInstanceDto, InstancePageListDto } from './dto/instance.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('流程实例')
@Controller('workflow/instance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class InstanceController {
  constructor(private readonly service: InstanceService) {}

  @ApiOperation({ summary: '发起流程' })
  @Post('start')
  async start(@Body() dto: StartInstanceDto, @Req() req: any) {
    return await this.service.start(dto, req.user?.username || 'admin');
  }

  @ApiOperation({ summary: '审批操作' })
  @Post('approve')
  async approve(@Body() dto: ApproveInstanceDto, @Req() req: any) {
    return await this.service.approve(dto, req.user?.username || 'admin');
  }

  @ApiOperation({ summary: '撤回流程' })
  @Post('withdraw')
  async withdraw(@Body() dto: WithdrawInstanceDto, @Req() req: any) {
    return await this.service.withdraw(dto.instanceId, req.user?.username || 'admin');
  }

  @ApiOperation({ summary: '我发起的流程列表' })
  @Post('page')
  async list(@Body() dto: InstancePageListDto, @Req() req: any) {
    return await this.service.findPageList(dto, req.user?.username || 'admin');
  }

  @ApiOperation({ summary: '流程实例详情' })
  @Post('detail')
  async detail(@Body() dto: { id: string }) {
    return await this.service.findOne(dto.id);
  }
}
