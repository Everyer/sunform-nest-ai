import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { BasePageDto } from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class CreateDto {
    @ApiProperty({ description: '岗位名称', example: "董事长" })
    @IsString()
    readonly postName?: string;

    @ApiProperty({ description: '岗位编码', example: "ceo" })
    @IsString()
    readonly postCode?: string;

    @ApiProperty({ description: '显示排序', example: 1 })
    @Transform(({ value }) => Number(value))
    @IsNumber()
    readonly sort?: number;

    @ApiProperty({ description: '岗位状态 (true:启用, false:禁用)', example: true })
    @IsBoolean()
    readonly status?: boolean;

    @ApiProperty({ description: '备注信息', example: "公司最高决策岗位", required: false })
    @IsString()
    @IsOptional()
    readonly remark?: string;
}
export class UpdateDto extends CreateDto {
    @ApiProperty({ description: '岗位ID', example: "uuid-post-id" })
    @IsString()
    @IsNotEmpty()
    readonly id: string;
}
export class PageListDto extends BasePageDto {
}