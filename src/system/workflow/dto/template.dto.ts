import { IsString, IsNumber, IsOptional, IsNotEmpty, IsArray, IsIn } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: '流程名称' })
  @IsString() @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: '流程编码' })
  @IsString() @IsNotEmpty()
  readonly code: string;

  @ApiProperty({ description: '分类', required: false })
  @IsString() @IsOptional()
  readonly category?: string;

  @ApiProperty({ description: '流程说明', required: false })
  @IsString() @IsOptional()
  readonly description?: string;

  @ApiProperty({ description: '关联表单定义ID', required: false })
  @IsString() @IsOptional()
  readonly formDefId?: string;

  @ApiProperty({ description: '节点列表（含坐标）', required: false })
  @IsArray() @IsOptional()
  readonly nodes?: any[];

  @ApiProperty({ description: '连线列表', required: false })
  @IsArray() @IsOptional()
  readonly edges?: any[];

  @ApiProperty({ description: '节点权限配置', required: false })
  @IsArray() @IsOptional()
  readonly nodePermissions?: any[];

  @ApiProperty({ description: '扩展配置', required: false })
  @IsOptional()
  readonly config?: any;
}

export class UpdateTemplateDto extends CreateTemplateDto {
  @ApiProperty({ description: '模板ID' })
  @IsString() @IsNotEmpty()
  readonly id: string;
}

export class TemplatePageListDto extends BasePageDto {
  @ApiProperty({ description: '搜索名称', required: false })
  @IsString() @IsOptional()
  readonly name?: string;

  @ApiProperty({ description: '分类过滤', required: false })
  @IsString() @IsOptional()
  readonly category?: string;

  @ApiProperty({ description: '状态过滤', required: false })
  @IsNumber() @IsOptional()
  readonly status?: number;
}

export class PublishTemplateDto {
  @ApiProperty({ description: '模板ID' })
  @IsString() @IsNotEmpty()
  readonly id: string;
}
