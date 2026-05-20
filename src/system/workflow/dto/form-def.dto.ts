import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormDefDto {
  @ApiProperty({ description: '表单名称' })
  @IsString() @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: '表单编码' })
  @IsString() @IsNotEmpty()
  readonly code: string;

  @ApiProperty({ description: '关联 Sunform 页面 ID', required: false })
  @IsString() @IsOptional()
  readonly sunformPageId?: string;

  @ApiProperty({ description: '表单描述', required: false })
  @IsString() @IsOptional()
  readonly description?: string;

  @ApiProperty({ description: '字段列表', required: false })
  @IsArray() @IsOptional()
  readonly fields?: any[];

  @ApiProperty({ description: '扩展配置', required: false })
  @IsOptional()
  readonly config?: any;
}

export class UpdateFormDefDto extends CreateFormDefDto {
  @ApiProperty({ description: '表单ID' })
  @IsString() @IsNotEmpty()
  readonly id: string;
}

export class FormDefPageListDto extends BasePageDto {
  @ApiProperty({ description: '搜索名称', required: false })
  @IsString() @IsOptional()
  readonly name?: string;

  @ApiProperty({ description: '搜索编码', required: false })
  @IsString() @IsOptional()
  readonly code?: string;
}
