import { IsString, IsOptional } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class TaskPageListDto extends BasePageDto {
  @ApiProperty({ description: '搜索标题', required: false })
  @IsString() @IsOptional()
  readonly title?: string;

  @ApiProperty({ description: '模板ID过滤', required: false })
  @IsString() @IsOptional()
  readonly templateId?: string;

  @ApiProperty({ description: '优先级过滤', required: false })
  @IsString() @IsOptional()
  readonly priority?: string;
}

export class TaskDetailDto {
  @ApiProperty({ description: '实例ID' })
  @IsString()
  readonly instanceId: string;

  @ApiProperty({ description: '节点ID' })
  @IsString()
  readonly nodeId: string;
}
