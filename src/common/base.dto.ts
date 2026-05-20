import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class BaseResponseDto {
    @ApiProperty({ description: '状态码', example: 0 })
    code: number;

    @ApiProperty({ description: '提示信息', example: '操作成功' })
    message: string;

    @ApiProperty({ description: '是否成功', example: true })
    success: boolean;

    @ApiProperty({ description: '返回数据', type: Object })
    data: any;
}

export class BaseCreateDto {
    @ApiProperty({ description: '创建者ID', example: 'uuid', required: false })
    @IsString()
    @IsOptional()
    readonly createBy?: string;
}

export class BasePageDto {
    @ApiProperty({ description: '当前页码', example: 1, default: 1 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    readonly pageindex: number;

    @ApiProperty({ description: '每页条数', example: 10, default: 10 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    readonly pagesize: number;
}