import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';

export class PageCreateDto extends BaseCreateDto {
    @ApiProperty({ description: '页面名称', example: "首页" })
    @IsString()
    @IsNotEmpty()
    readonly pageName: string;

    @ApiProperty({ description: '项目ID', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly projectId: string;

    @ApiProperty({ description: '是否可用', example: true })
    @IsBoolean()
    @IsNotEmpty()
    readonly isEnable: boolean;

    @ApiProperty({ description: '备注', example: "页面备注信息", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}

export class PageUpdateDto extends PageCreateDto {
    @ApiProperty({ description: 'ID', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}

export class PagePageListDto extends BasePageDto {
    @ApiProperty({ description: '页面名称', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly pageName?: string;

    @ApiProperty({ description: '项目ID', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly projectId?: string;

    @ApiProperty({ description: '是否可用', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    readonly isEnable?: boolean;

    @ApiProperty({ description: '创建人', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly createBy?: string;
} 