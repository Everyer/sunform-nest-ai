import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';
export class DepartmentCreateDto {
    @ApiProperty({ description: '上级部门ID', example: "0", required: false })
    @IsString()
    @IsOptional()
    readonly pid?: string;

    @ApiProperty({ description: '部门名称', example: "研发部" })
    @IsString()
    readonly departmentName?: string;

    @ApiProperty({ description: '部门负责人', example: "张三", required: false })
    @IsString()
    readonly leader?: string;

    @ApiProperty({ description: '显示排序', example: 1 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    readonly sort?: number;

    @ApiProperty({ description: '部门状态 (true:启用, false:禁用)', example: true })
    @IsBoolean()
    readonly status?: boolean;

    @ApiProperty({ description: '备注信息', example: "主要负责产品研发", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}
export class DepartmentUpdateDto extends DepartmentCreateDto {
    @ApiProperty({ description: '部门ID', example: "uuid-dept-id" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}
export class DepartmentPageListDto extends BasePageDto {
}