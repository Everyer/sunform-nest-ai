import { IsString, IsOptional, IsNotEmpty, IsObject, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageDto } from '../../../common/base.dto';

export class LowcodeLogCreateDto {
    @ApiProperty({ description: '低代码配置代码', example: "config_001" })
    @IsString()
    @IsNotEmpty()
    readonly componentCode: string;

    @ApiProperty({ description: '组件配置', example: {} })
    @IsObject()
    @IsNotEmpty()
    readonly componentConfig: object;

    @ApiProperty({ description: '组件名称', example: "表单组件" })
    @IsString()
    @IsNotEmpty()
    readonly componentName: string;
}

export class LowcodeLogPageListDto extends BasePageDto {
    @ApiProperty({ description: '低代码配置代码', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly componentCode?: string;

    @ApiProperty({ description: '组件名称', example: "", required: false })
    @IsString()
    @IsOptional()
    readonly componentName?: string;
}

export class LowcodeLogByCodeDto {
    @ApiProperty({ description: '低代码配置代码', example: "config_001" })
    @IsString()
    @IsNotEmpty()
    readonly componentCode: string;
}

export class LowcodeLogPageByCodeDto extends BasePageDto {
    @ApiProperty({ description: '低代码配置代码', example: "config_001" })
    @IsString()
    @IsNotEmpty()
    readonly componentCode: string;
}

export class LowcodeLogUpdateRemarkDto {
    @ApiProperty({ description: '日志ID', example: "uuid-string" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;

    @ApiProperty({ description: '备注内容', example: "这是一条备注", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
} 