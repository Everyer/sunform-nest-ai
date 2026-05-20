import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DictCreateDto {
    @ApiProperty({ description: '父级字典ID', example: "0", required: false })
    @IsString()
    @IsOptional()
    readonly pid?: string;

    @ApiProperty({ description: '字典标签', example: "男" })
    @IsString()
    @IsNotEmpty()
    readonly label: string;

    @ApiProperty({ description: '字典值/编码', example: "1" })
    @IsString()
    @IsNotEmpty()
    readonly value: string;

    @ApiProperty({ description: '字典状态 (true:启用, false:禁用)', example: true })
    @IsBoolean()
    readonly status: boolean;

    @ApiProperty({ description: '显示排序', example: 1 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    readonly sort: number;

    @ApiProperty({ description: '备注信息', example: "性别男的字典定义", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}

export class DictUpdateDto extends DictCreateDto {
    @ApiProperty({ description: '字典ID', example: "uuid-dict-id" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}

export class DictPageListDto extends BasePageDto {
    @ApiProperty({ description: '搜索标签名称', example: "男", required: false })
    @IsString()
    @IsOptional()
    readonly label?: string;

    @ApiProperty({ description: '搜索字典编码', example: "1", required: false })
    @IsString()
    @IsOptional()
    readonly value?: string;

    @ApiProperty({ description: '状态过滤', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    readonly status?: boolean;
}