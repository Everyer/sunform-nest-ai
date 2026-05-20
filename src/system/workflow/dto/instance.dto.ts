import { IsString, IsOptional, IsNotEmpty, IsIn, IsArray } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class StartInstanceDto {
  @ApiProperty({ description: '流程模板ID' })
  @IsString() @IsNotEmpty()
  readonly templateId: string;

  @ApiProperty({ description: '实例标题' })
  @IsString() @IsOptional()
  readonly title?: string;

  @ApiProperty({ description: '表单数据' })
  @IsNotEmpty()
  readonly formData: any;

  @ApiProperty({ description: '是否仅保存草稿（不进入审批流）', required: false, default: false })
  @IsOptional()
  readonly draft?: boolean;

  @ApiProperty({ description: '优先级：0=普通 1=紧急 2=特急', required: false, default: 0 })
  @IsIn([0, 1, 2]) @IsOptional()
  readonly priority?: number;

  @ApiProperty({ description: '截止日期', required: false })
  @IsString() @IsOptional()
  readonly dueDate?: string;

  @ApiProperty({ description: '附件列表', required: false })
  @IsArray() @IsOptional()
  readonly attachments?: any[];

  @ApiProperty({ description: '编辑草稿时传入已有实例ID', required: false })
  @IsString() @IsOptional()
  readonly instanceId?: string;
}

export class ApproveInstanceDto {
  @ApiProperty({ description: '流程实例ID' })
  @IsString() @IsNotEmpty()
  readonly instanceId: string;

  @ApiProperty({ description: '节点ID' })
  @IsString() @IsNotEmpty()
  readonly nodeId: string;

  @ApiProperty({ description: '操作：agree/reject/transfer/addSign' })
  @IsString() @IsIn(['agree', 'reject', 'transfer', 'addSign'])
  readonly action: string;

  @ApiProperty({ description: '审批意见', required: false })
  @IsString() @IsOptional()
  readonly comment?: string;

  @ApiProperty({ description: '表单数据变更', required: false })
  @IsOptional()
  readonly formData?: any;

  @ApiProperty({ description: '转交目标人（转交时必填）', required: false })
  @IsString() @IsOptional()
  readonly transferTo?: string;

  @ApiProperty({ description: '加签人（加签时必填）', required: false })
  @IsString() @IsOptional()
  readonly addSignTo?: string;

  @ApiProperty({ description: '附件列表', required: false })
  @IsArray() @IsOptional()
  readonly attachments?: any[];
}

export class WithdrawInstanceDto {
  @ApiProperty({ description: '流程实例ID' })
  @IsString() @IsNotEmpty()
  readonly instanceId: string;
}

export class InstancePageListDto extends BasePageDto {
  @ApiProperty({ description: '搜索标题', required: false })
  @IsString() @IsOptional()
  readonly title?: string;

  @ApiProperty({ description: '状态过滤', required: false })
  @IsString() @IsOptional()
  readonly status?: string;

  @ApiProperty({ description: '模板ID过滤', required: false })
  @IsString() @IsOptional()
  readonly templateId?: string;
}
