import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';

export class ProjectCreateDto extends BaseCreateDto {
    @ApiProperty({ description: '项目名称', example: "我的项目" })
    @IsString()
    @IsNotEmpty()
    readonly projectName: string;

    @ApiProperty({ description: '是否可用', example: true })
    @IsBoolean()
    readonly isEnable: boolean;

    @ApiProperty({ description: '备注', example: "项目备注信息" })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}

export class ProjectUpdateDto extends ProjectCreateDto {
    @ApiProperty({ description: 'ID', example: "" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}

export class ProjectPageListDto extends BasePageDto {
    @ApiProperty({ description: '项目名称', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly projectName?: string;

    @ApiProperty({ description: '是否可用', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    readonly isEnable?: boolean;

    @ApiProperty({ description: '创建人', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly createBy?: string;
} 