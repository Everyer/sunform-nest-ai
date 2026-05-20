import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskPageListDto, TaskDetailDto } from './dto/task.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('流程任务')
@Controller('workflow/task')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @ApiOperation({ summary: '我的待办' })
  @Post('todo')
  async todo(@Body() dto: TaskPageListDto, @Req() req: any) {
    return await this.service.findTodo(dto, req.user?.username || 'admin');
  }

  @ApiOperation({ summary: '我的已办' })
  @Post('done')
  async done(@Body() dto: TaskPageListDto, @Req() req: any) {
    return await this.service.findDone(dto, req.user?.username || 'admin');
  }

  @ApiOperation({ summary: '待办/已办详情' })
  @Post('detail')
  async detail(@Body() dto: TaskDetailDto) {
    return await this.service.detail(dto.instanceId, dto.nodeId);
  }
}
